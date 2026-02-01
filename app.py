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
st.set_page_config(page_title="AeroDoc AI | Groq Edition", layout="wide")

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

st.title("🚀 Multi-lingual RAG PDF QA with Groq")
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
            if len(sent.strip()) > 20:
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
    query = st.text_input("Ask a question (English, Marathi, Hindi, etc.)")

    if query:
        with st.spinner("⚡ Groq Intelligence Engine Processing..."):
            try:
                # 4) Query embedding (local)
                q_emb = embed_texts([query])[0]

                # 5) Retrieval
                search_pool = [{"emb": e, **chunks[i]} for i, e in enumerate(chunk_embs)]
                results = retrieve_chunks(q_emb, search_pool, top_k=5)

                context = "\n\n".join([f"Source: {r['doc']}, Page: {r['page']}\nContent: {r['text']}" for r in results])

                # 6) Generate answer with Groq (Using Llama 3)
                prompt = f"{ANSWER_PROMPT}\n\nContext:\n{context}\n\nQuestion: {query}"
                
                completion = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.2,
                    max_tokens=1024
                )
                answer_raw = completion.choices[0].message.content
                
                # 7) Self-verification
                verification = verify_answer(query, answer_raw, context)

                # 8) Confidence Score
                conf_score = np.mean([cosine_sim(q_emb, r["emb"]) for r in results]) * 100

                # Display Results
                col1, col2 = st.columns([2, 1])

                with col1:
                    st.subheader("💡 Expert Answer")
                    st.markdown(answer_raw)
                    
                    st.subheader("📊 Reliability Metrics")
                    st.write(f"**Confidence Score:** `{conf_score:.2f}%`")
                    st.write(f"**Verification Status:**")
                    st.info(verification)

                with col2:
                    st.subheader("📑 Evidence Highlights")
                    for r in results:
                        with st.expander(f"Snippet from {r['doc']} (Page {r['page']})"):
                            st.write(r['text'])
                            st.progress(float(cosine_sim(q_emb, r["emb"])))

            except Exception as e:
                st.error(f"Error communicating with Groq: {str(e)}")
else:
    st.warning("Please upload at least one PDF to get started.")

st.markdown("---")
st.caption("AeroDoc AI Python | Groq Llama-3 Edition")
