# 🚀 QARAG | Premium Multilingual RAG Engine

A professional Document Intelligence & QA system designed for educational textbooks (Marathi & English). Built with a "local-embeddings, cloud-synthesis" architecture to provide high-speed, grounded, and explainable insights.

## 🏆 System Improvement Summary
We resolved partial-verification failures by enforcing strict passage-grounded answer synthesis and implementing an **Internal Post-Check** logic. This eliminates external philosophical interpretations while preserving character-based contextual explanations from the text.

## 🛠️ Technology Stack
- **Backend**: Python 3.10+
- **UI**: Streamlit (Glassmorphic Dark Mode)
- **Intelligence (LLM)**: **Llama 3.3 70B** (via Groq LPU for ultra-fast inference)
- **Embeddings**: `all-MiniLM-L6-v2` (Local Multilingual Sentence-Transformers)
- **Retriever**: In-memory Cosine Similarity Matrix
- **Parser**: `pdfplumber` (Page-aware structural extraction)

## 🧠 Advanced Features
- **Strict Grounding**: Ruleset to prevent hallucinations and general-knowledge bias.
- **Explainable RAG Pipeline**: Step-by-step reporting of the document processing and reasoning steps.
- **Semantic Evidence Matrix**: Multi-parameter display showing **Rank**, **Similarity %**, and **Page Trace** for top 7 context chunks.
- **Multilingual Intelligence**: Native support for Marathi and English with automatic language detection and confidence scoring.
- **Traceable Highlights**: Direct evidence snippets extracted page-wise from the PDF.

## 🚀 Installation & Setup

1. **Clone the Project**:
   ```bash
   git clone <repository-url>
   cd rag_gemini_pdf
   ```

2. **Initialize Environment**:
   ```bash
   # Create Virtual Env
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install Dependencies
   pip install -r requirements.txt
   ```

3. **Configure API Keys**:
   Create or edit the `.env` file:
   ```env
   GROQ_API_KEY="your_groq_api_key_here"
   ```

4. **Run Application**:
   ```bash
   streamlit run app.py
   ```

## 📂 Project Structure
- `app.py`: Main Streamlit logic and RAG orchestration.
- `core/`: 
  - `embeddings.py`: Vector generation logic.
  - `retrieval.py`: Cosine similarity search.
  - `pdf_loader.py`: Text and page extraction.
  - `verifier.py`: LLM-based verification layer.
- `prompts/`: 
  - `answer_prompt.txt`: Strict grounding and synthesis rules.
  - `verify_prompt.txt`: Self-verification logic.

---
*Developed with ❤️ by Antigravity*