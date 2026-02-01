import streamlit as st
import os
import nltk
import numpy as np
from dotenv import load_dotenv
from groq import Groq
from core.pdf_loader import extract_text
from core.embeddings import embed_texts
from core.retrieval import retrieve_chunks, cosine_sim
from core.verifier import verify_answer
from core.prompts import ANSWER_PROMPT

# Set page config for a premium look
st.set_page_config(page_title="AeroDoc AI | Premium RAG", layout="wide")

# Custom CSS for glassmorphic design
st.markdown("""
<style>
    .stApp {
        background: #0a0a0c;
        color: #f8fafc;
    }
    [data-testid="stSidebar"] {
        background-color: #050506;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
    }
    .stHeader {
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(10px);
    }
    .metric-card {
        background: rgba(255, 255, 255, 0.05);
        padding: 15px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 15px;
    }
</style>
""", unsafe_allow_html=True)

load_dotenv()
# Download NLTK requirements
nltk.download("punkt")
nltk.download("punkt_tab")

# Initialize Groq Client
api_key = os.getenv("GROQ_API_KEY")
if not api_key or "PASTE" in api_key:
    st.error("Invalid Groq API Key found in .env file. Please update GROQ_API_KEY.")
    st.stop()

client = Groq(api_key=api_key)

st.title("🚀 AeroDoc AI: Multilingual RAG Intelligence")
st.markdown("---")

with st.sidebar:
    st.header("📄 Document Center")
    uploaded = st.file_uploader("Upload PDFs", accept_multiple_files=True, type=['pdf'])
    st.info("Upload your documents to begin semantic indexing.")

if uploaded:
    # 1) Extract PDF text (with caching)
    @st.cache_data
    def load_docs(uploaded_files):
        all_docs = []
        for f in uploaded_files:
            docs = extract_text(f)
            for d in docs:
                d["filename"] = f.name
            all_docs.extend(docs)
        return all_docs

    docs_data = load_docs(uploaded)
    
    # 2) Chunking (Sentence Level)
    chunks = []
    for d in docs_data:
        sentences = nltk.sent_tokenize(d["text"])
        for sent in sentences:
            if len(sent.strip()) > 30: # Filter noise
                chunks.append({
                    "text": sent,
                    "doc": d["filename"],
                    "page": d["page"]
                })
    
    # 3) Embeddings (Cached)
    @st.cache_resource
    def get_embeddings(_chunk_texts):
        return embed_texts(_chunk_texts)

    chunk_texts = [c["text"] for c in chunks]
    if chunk_texts:
        chunk_embs = get_embeddings(chunk_texts)
    else:
        st.error("No extractable text found in the PDFs.")
        st.stop()

    # Question Input
    query = st.text_input("Ask a question (English or Marathi)")

    if query:
        with st.spinner("⚡ Processing RAG Pipeline..."):
            try:
                # 4) Query embedding (local)
                q_emb = embed_texts([query])[0]

                # 5) Retrieval
                search_pool = [{"emb": e, **chunks[i]} for i, e in enumerate(chunk_embs)]
                results = retrieve_chunks(q_emb, search_pool, top_k=7) 

                context = "\n\n".join([f"Source: {r['doc']}, Page: {r['page']}\nContent: {r['text']}" for r in results])

                # 6) Generate answer with Groq (Using Llama 3)
                prompt = (
                    f"{ANSWER_PROMPT}\n\n"
                    f"USER QUERY: {query}\n\n"
                    f"RETRIVED CONTEXT CHUNKS:\n{context}\n\n"
                    f"Strictly follow the requested OUTPUT FORMAT."
                )
                
                completion = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1, 
                    max_tokens=1500
                )
                answer_raw = completion.choices[0].message.content
                
                # Display Results
                st.markdown(answer_raw)
                
                # --- NEW: Enhanced Evidence Multi-Parameter Display ---
                st.markdown("---")
                st.subheader("📊 Semantic Evidence Matrix")
                st.write("Multiple supporting contexts retrieved based on vector similarity:")
                
                for idx, r in enumerate(results):
                    score = float(cosine_sim(q_emb, r["emb"]))
                    match_percent = score * 100
                    
                    # Color coding based on match quality
                    status_color = "🟢 High Match" if match_percent > 85 else "🟡 Medium Match" if match_percent > 70 else "⚪ Low Match"
                    
                    with st.expander(f"📌 Rank #{idx+1} | {status_color} ({match_percent:.1f}%) | Page {r['page']}"):
                        st.markdown(f"**Source File:** `{r['doc']}`")
                        st.markdown(f"**Retrieved Context:**")
                        st.info(r['text'])
                        st.markdown(f"*Similarity metric: {score:.4f}*")
                        st.progress(score)

                # 7) Self-verification (Internal check)
                with st.expander("🔍 AI Self-Verification Deep-Dive"):
                    verification = verify_answer(query, answer_raw, context)
                    st.write(verification)

            except Exception as e:
                st.error(f"Error communicating with Groq: {str(e)}")
else:
    st.warning("Please upload at least one PDF to get started.")

st.markdown("---")
st.caption("AeroDoc AI Premium | Multilingual RAG Engine v3.0")
