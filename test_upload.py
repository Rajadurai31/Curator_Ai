import requests

# Test the resume upload endpoint
url = "http://localhost:8000/api/resume/upload"

# Create a simple test file content
test_content = """John Doe
Software Engineer

Skills:
- Python
- JavaScript
- React
- FastAPI
- SQL

Experience:
- 3 years as Full Stack Developer
- Built web applications using React and Python
- Worked with databases and APIs"""

# Test with a text file (should fail - only PDF/DOCX allowed)
files = {'file': ('test_resume.txt', test_content, 'text/plain')}
response = requests.post(url, files=files)
print(f"Text file response: {response.status_code}")
print(f"Response: {response.text}")