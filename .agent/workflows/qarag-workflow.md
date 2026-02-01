---
description: QARAG System Workflow & Advanced Development Guide
---

# 🌀 QARAG: Operational Blueprint

This document outlines the end-to-end technical workflow, data lifecycle, and development standards for the QARAG Intelligence Engine.

## 1. Data Ingestion Workflow (Indexing)
When a user uploads a document through the **Index Documents** portal:

1.  **Transport Layer**: Files are streamed via `FastAPI` (Multipart form-data) to the `/upload` endpoint.
2.  **Structural Extraction**: `pdfplumber` parses the PDF, preserving page numbers and text coordinates to maintain **Traceability**.
3.  **Neural Chunking**: The raw text is broken into semantic segments (approx. 1000 characters with 200 character overlap).
4.  **Vector Mapping**: Each chunk is passed through the `all-MiniLM-L6-v2` local model, generating a high-dimensional embedding.
5.  **State Synchronization**: The document metadata and vectors are stored in the server's in-memory memory bank, and the frontend is notified to refresh the **Doc Repositories** list.

## 2. Intelligence Retrieval Workflow (Querying)
When a user submits a query:

1.  **Intent Vectorization**: The user's natural language query is converted into a vector using the same local embedding model.
2.  **Semantic Matrix Search**: The system performs a **Cosine Similarity** scan across all indexed document chunks.
3.  **Context Assembly**: The top 7 most relevant chunks (Passage 1 to 7) are selected.
4.  **Neural Synthesis (LLM)**: The query and retrieved context are injected into the **Synthesis Prompt**. Llama 3.3 70B (via Groq) generates a grounded answer.
5.  **Traceability Protocol (Self-Audit)**: A separate call to the **Verifier Engine** checks if the LLM's claims are explicitly supported by the retrieved context.
6.  **Dashboard Rendering**: The answer, verification logs, and **Neural Audit Matrix** are pushed to the React UI.

## 3. Technology Stack Reference
| Tier | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | FastAPI / Python 3.10 | High-performance API orchestration |
| **UI** | React (Vite) / TypeScript | Responsive, stateful intelligence dashboard |
| **Animations** | Framer Motion | Physics-based transitions and micro-interactions |
| **LLM Core** | Llama 3.3 70B (Groq) | Ultra-fast semantic reasoning |
| **Embeddings** | Sentence-Transformers | Local privacy-first vectorization |
| **Retrieval** | In-Memory Vector Search | Milli-second response times for data fetching |

## 🚀 Development Workflow

### Adding New Features
// turbo
1. Ensure the backend is active: `venv\Scripts\python -m uvicorn backend:app --reload`
// turbo
2. Ensure the frontend is active: `cd frontend && npm run dev`
3. If modifying the RAG pipeline logic, edit `backend.py` or the `core/` directory.
4. If modifying the UI/Branding, update `App.tsx` and `index.css`.

### Quality Standards
- **Strict Grounding**: Never allow the LLM to use external knowledge. Use the `prompts/answer_prompt.txt` to enforce rules.
- **Glassmorphism**: When adding UI components, use the `--glass-blur` and `--border-color` variables defined in `index.css`.
- **Traceability**: Every feature must provide a "Source Link" or "Similarity Score" to ensure users can verify AI claims.
