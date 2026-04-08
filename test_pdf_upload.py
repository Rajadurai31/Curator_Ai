import requests
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

# Create a simple PDF in memory
buffer = BytesIO()
p = canvas.Canvas(buffer, pagesize=letter)
p.drawString(100, 750, "John Doe")
p.drawString(100, 730, "Software Engineer")
p.drawString(100, 700, "Skills:")
p.drawString(120, 680, "- Python")
p.drawString(120, 660, "- JavaScript") 
p.drawString(120, 640, "- React")
p.drawString(120, 620, "- FastAPI")
p.drawString(100, 590, "Experience:")
p.drawString(120, 570, "- 3 years as Full Stack Developer")
p.save()

pdf_content = buffer.getvalue()
buffer.close()

# Test the resume upload endpoint
url = "http://localhost:8000/api/resume/upload"
files = {'file': ('test_resume.pdf', pdf_content, 'application/pdf')}

try:
    response = requests.post(url, files=files)
    print(f"PDF upload response: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Extracted text length: {len(result['resume_text'])}")
        print(f"First 200 chars: {result['resume_text'][:200]}")
    else:
        print(f"Error response: {response.text}")
except Exception as e:
    print(f"Error: {e}")