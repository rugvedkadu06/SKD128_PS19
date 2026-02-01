# 🚀 QARAG | Ultra-Premium Multilingual RAG Engine

A state-of-the-art Document Intelligence & QA system designed for high-performance retrieval and synthesis. Built with a **FastAPI** backend and a **React-Vite** "Super-Duper" UI, QARAG provides grounded, explainable, and lightning-fast insights from your documents (optimised for Marathi & English).

> 🌀 **Deep Dive**: Check out the [Detailed System Workflow](.agent/workflows/qarag-workflow.md) for a complete technical blueprint of the indexing and retrieval pipelines.

## 🏆 System Architecture
QARAG utilizes a "Local-Embeddings, Cloud-Synthesis" model. Heavy vectorization happens locally to preserve privacy and speed, while complex reasoning is offloaded to massive LLMs via high-speed LPUs.

## 🛠️ Technology Stack
- **Frontend**: React 18, Vite, Framer Motion (Physics-based animations), Lucide Icons.
- **Backend**: FastAPI (Python 3.10+), Uvicorn.
- **Intelligence (LLM)**: **Llama 3.3 70B** (via Groq LPU for <500ms inference).
- **Embeddings**: `all-MiniLM-L6-v2` (Local Multilingual Sentence-Transformers).
- **Retriever**: Vector Similarity Matrix with Cosine Scoring.
- **Parser**: `pdfplumber` (Structural page-aware extraction).

## 🧠 Advanced Features
- **Neural Audit Matrix**: Real-time visualization of source chunks, similarity scores, and page-wise traceability.
- **Traceability Protocol**: Integrated AI self-verification layer that audits answers against retrieved context.
- **Multilingual Core**: Seamlessly handles Marathi and English queries with high semantic accuracy.
- **Processing Widget**: Real-time feedback on upload, neural parsing, and vector mapping stages.
- **Super-Duper UI**: Cyber-aesthetic dashboard with glassmorphism, mesh-gradients, and responsive drawers.

## 🚀 Installation & Setup

### 1. Backend Setup
```bash
cd rag_gemini_pdf
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt fastapi uvicorn python-multipart
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

### 3. Configuration
Create a `.env` file in the root:
```env
GROQ_API_KEY="your_groq_api_key_here"
```

### 4. Execution
**Run Backend:**
```bash
python backend.py
```
**Run Frontend:**
```bash
cd frontend
npm run dev
```

## 📂 Project Structure
- `backend.py`: FastAPI server and API endpoints.
- `core/`: RAG logic (Embeddings, Retrieval, PDF Loading, Verifier).
- `frontend/`: React-Vite dashboard codebase.
- `prompts/`: Logic-gate prompts for synthesis and verification.

---

## 🔮 Future Roadmap: The Next Level
We are constantly pushing the boundaries of what's possible in Document Intelligence. Here is what's coming next:

1. **Hybrid Neural Search**: Implementation of **BM25 + Semantic Cross-Ranking** to ensure hyper-precision for technical dates and names while maintaining semantic depth.
2. **Multi-Modal Vision**: Support for **Table & Chart Reasoning**. Extract and chat with complex diagrams using Llama 3.2 Vision or GPT-4o integration.
3. **Infinite Memory**: Conversational context window expansion, allowing for complex follow-up questions and long-form research sessions.
4. **Source Highlighting**: A built-in PDF viewer that automatically scrolls to and highlights the exact sentence used as evidence.
5. **Agentic Workflows**: Give QARAG the power to summarize entire folders, compare documents, and generate comprehensive research reports.
6. **Voice Synthesis**: Multilingual TTS (Text-to-Speech) to hear your document answers in a natural voice.
7. **Offline Mode**: Integration with local LLMs (via Ollama) for zero-latency, 100% private intelligence on local hardware.

---
*Developed with ❤️ by Antigravity*