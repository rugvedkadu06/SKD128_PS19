from groq import Groq
import os
from dotenv import load_dotenv
from .prompts import VERIFY_PROMPT

load_dotenv()

# Initialize Groq Client
api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key) if api_key else None

def verify_answer(question, answer, context):
    if not client:
        return "Verifier: Groq API key missing."
        
    try:
        prompt = f"{VERIFY_PROMPT}\n\nQuestion: {question}\nAnswer: {answer}\nContext: {context}"
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            max_tokens=300
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Verification failed: {str(e)}"
