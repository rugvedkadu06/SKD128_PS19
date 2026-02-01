from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import io
import nltk
from typing import List
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
from core.pdf_loader import extract_text
from core.embeddings import embed_texts
from core.retrieval import retrieve_chunks, cosine_sim
from core.verifier import verify_answer
from core.prompts import ANSWER_PROMPT

load_dotenv()

app = FastAPI()

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq Client
api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)

# In-memory storage for chunks (In a real app, this would be a vector DB or session-based)
# For this "complete frontend" demo, we'll keep it simple but functional.
class DocumentStore:
    def __init__(self):
        self.chunks = []
        self.embeddings = []
        self.filenames = []

store = DocumentStore()

class QueryRequest(BaseModel):
    query: str

@app.post("/upload")
async def upload_pdfs(files: List[UploadFile] = File(...)):
    global store
    new_chunks = []
    
    for file in files:
        contents = await file.read()
        # Create a temp file-like object
        pdf_file = io.BytesIO(contents)
        pdf_file.name = file.filename
        
        docs_data = extract_text(pdf_file)
        for d in docs_data:
            d["filename"] = file.filename
            
            sentences = nltk.sent_tokenize(d["text"])
            for sent in sentences:
                if len(sent.strip()) > 30:
                    new_chunks.append({
                        "text": sent,
                        "doc": d["filename"],
                        "page": d["page"]
                    })
    
    if not new_chunks:
        raise HTTPException(status_code=400, detail="No extractable text found.")

    chunk_texts = [c["text"] for c in new_chunks]
    chunk_embs = embed_texts(chunk_texts)
    
    # Store in memory
    store.chunks.extend(new_chunks)
    # We need to store embeddings linked to chunks
    for i, emb in enumerate(chunk_embs):
        store.chunks[len(store.chunks) - len(new_chunks) + i]["emb"] = emb
        
    if file.filename not in store.filenames:
        store.filenames.append(file.filename)

    return {"status": "success", "processed_files": len(files), "total_chunks": len(store.chunks)}

@app.post("/query")
async def query_rag(request: QueryRequest):
    if not store.chunks:
        raise HTTPException(status_code=400, detail="No documents uploaded yet.")
    
    query = request.query
    try:
        # 1) Query embedding
        q_emb = embed_texts([query])[0]

        # 2) Retrieval
        results = retrieve_chunks(q_emb, store.chunks, top_k=7) 
        
        context_parts = []
        evidence = []
        
        for idx, r in enumerate(results):
            score = float(cosine_sim(q_emb, r["emb"]))
            match_percent = score * 100
            
            context_parts.append(f"Source: {r['doc']}, Page: {r['page']}\nContent: {r['text']}")
            
            evidence.append({
                "rank": idx + 1,
                "filename": r["doc"],
                "page": r["page"],
                "text": r["text"],
                "score": score,
                "match_percent": match_percent,
                "status": "High Match" if match_percent > 85 else "Medium Match" if match_percent > 70 else "Low Match"
            })

        context = "\n\n".join(context_parts)

        # 3) Generate answer
        prompt = (
            f"{ANSWER_PROMPT}\n\n"
            f"USER QUERY: {query}\n\n"
            f"RETRIVED CONTEXT CHUNKS:\n{context}\n\n"
            f"Strictly follow the requested OUTPUT FORMAT."
        )
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1, 
            max_tokens=1500
        )
        answer_raw = completion.choices[0].message.content
        
        # 4) Verification
        verification = verify_answer(query, answer_raw, context)

        return {
            "answer": answer_raw,
            "evidence": evidence,
            "verification": verification
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/files")
async def list_files():
    return {"files": store.filenames}

@app.post("/clear")
async def clear_store():
    global store
    store = DocumentStore()
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
