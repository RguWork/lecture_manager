import os
import openai
from docx import Document
from PyPDF2 import PdfReader

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
def summarize_text(text):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that summarizes lecture notes in a digestible way."},
            {"role": "user", "content": f"Summarize the following lecture:\n\n{text}"}
        ],
        max_tokens=667,
        temperature=0.5,
    )
    return response.choices[0].message.content

def extract_text_from_file(file):
    name = file.name
    ext = os.path.splitext(name)[-1].lower()

    if ext == ".txt":
        return file.read().decode("utf-8")
    elif ext == ".docx":
        doc = Document(file)
        return "\n".join(p.text for p in doc.paragraphs)
    elif ext == ".pdf":
        reader = PdfReader(file)
        return "\n".join(page.extract_text() for page in reader.pages)
    else:
        raise ValueError('Unsupported file format.')
