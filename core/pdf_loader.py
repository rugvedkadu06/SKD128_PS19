import pdfplumber

def extract_text(pdf_file):
    text = []
    with pdfplumber.open(pdf_file) as pdf:
        for i, page in enumerate(pdf.pages):
            txt = page.extract_text()
            if txt:
                text.append({"page": i+1, "text": txt})
    return text
