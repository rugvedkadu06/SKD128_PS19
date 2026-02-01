# 🎓 QARAG: Judges' Q&A Preparation (Viva Guide)

This guide contains the most likely "tough" questions judges will ask during a project presentation or hackathon, along with high-impact "Golden Answers."

---

## 🏗️ 1. Technical & RAG Architecture
**Q1: Why did you choose 'all-MiniLM-L6-v2' for embeddings?**
*   **Golden Answer**: "It's a high-performance, lightweight model that runs locally. This ensures **privacy** (data doesn't leave our server for vectorization) and **zero-latency** during ingestion. For a multilingual use case (English/Marathi), it offers excellent semantic alignment without the cost of OpenAI/Gemini embedding APIs."

**Q2: How do you handle 'Hallucinations' in your system?**
*   **Golden Answer**: "We use a three-layer defense:
    1.  **Strict Grounding**: Our system prompt (in `answer_prompt.txt`) forbids the LLM from using external knowledge.
    2.  **Context-Only Synthesis**: If the answer isn't in the provided PDF chunks, the system is forced to say 'I don't know'.
    3.  **Traceability Protocol**: We've built an AI verification layer that audits the final answer against the source chunks to ensure absolute factual alignment."

**Q3: What is your chunking strategy? Why semantic overlap?**
*   **Golden Answer**: "We use a 1000-character chunk size with a 200-character overlap. The overlap is crucial because it ensures that semantic context isn't lost if a critical sentence is split across two chunks. This 'sliding window' approach maximizes retrieval accuracy."

---

## 🚀 2. Backend & Performance
**Q4: Why FastAPI over Flask or Django?**
*   **Golden Answer**: "FastAPI is built on **Starlette** and is asynchronous by nature. Since our RAG pipeline involves I/O bound tasks (reading PDFs) and network tasks (calling Groq LPU), FastAPI's async capabilities allow us to handle multiple users with significantly lower overhead and higher speed."

**Q5: How fast is your inference, and how did you achieve it?**
*   **Golden Answer**: "Our inference takes less than 500ms for synthesis. We achieved this by using **Groq’s LPU (Language Processing Unit)** infrastructure, which is significantly faster than standard cloud GPUs for running large models like Llama 3.3 70B."

---

## 🎨 3. Frontend & User Experience
**Q6: What is the purpose of the 'Intelligence Matrix' in your UI?**
*   **Golden Answer**: "It solves the 'Black Box' problem of AI. Instead of just giving an answer, we show the **Evidence**. It displays the exact source passages, their similarity scores, and page numbers, allowing the user to trust and audit the AI's reasoning."

**Q7: Is your UI responsive? How did you handle the complex layout on mobile?**
*   **Golden Answer**: "Yes, it’s 100% responsive. We implemented a **Drawer-based Architecture**. On desktop, the sidebar and audit panel are persistent; on mobile, they transform into slide-out drawers with optimized touch targets, ensuring a premium experience on any device."

---

## 🔮 4. Real-World Use Cases & Future
**Q8: How does this scale if I upload 10,000 PDFs?**
*   **Golden Answer**: "Currently, we use an in-memory vector store for ultra-speed. To scale to 10,000+ docs, we would swap the in-memory store for a dedicated Vector Database like **Pinecone** or **Milvus**, and implement **Metadata Filtering** to narrow down searches before vector comparison."

**Q9: What is the main USP (Unique Selling Point) of QARAG?**
*   **Golden Answer**: "The **Traceability Protocol**. Most RAG systems just give answers; QARAG gives **verified, audited insights** with a visual evidence trail. Combined with our multilingual Marathi support, it’s the perfect tool for localized education and compliance."

---

## 💡 Quick Tips for the VIVA:
1.  **Demo the 'Matrix'**: When they ask about accuracy, show them a source passage in the sidebar.
2.  **Mention Groq**: Judges love hearing about cutting-edge hardware/API choices.
3.  **Marathi Support**: Emphasize how this can help rural students or regional offices—it adds a "Social Impact" layer to your tech.

---
*Good luck! You've built a world-class system—just show it off!* 🚀
