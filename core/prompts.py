import os

# Get the base directory of the project
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load_prompt(filename):
    path = os.path.join(BASE_DIR, "prompts", filename)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

ANSWER_PROMPT = load_prompt("answer_prompt.txt")
VERIFY_PROMPT = load_prompt("verify_prompt.txt")
