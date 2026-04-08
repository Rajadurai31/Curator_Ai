import requests
import json

# Test the full analysis pipeline
url = "http://localhost:8000/api/analyze/full"

# Sample data
resume_text = """John Doe
Software Engineer

Skills:
- Python
- JavaScript
- React
- FastAPI
- SQL
- Git

Experience:
- 3 years as Full Stack Developer
- Built web applications using React and Python
- Worked with databases and APIs
- Experience with REST APIs and microservices"""

job_text = """Senior Full Stack Developer

We are looking for a Senior Full Stack Developer to join our team.

Required Skills:
- Python
- React
- Node.js
- PostgreSQL
- Docker
- AWS
- TypeScript
- GraphQL

Nice to have:
- Kubernetes
- Redis
- MongoDB

Responsibilities:
- Build scalable web applications
- Work with microservices architecture
- Collaborate with cross-functional teams"""

payload = {
    "resume_text": resume_text,
    "job_text": job_text
}

try:
    response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'})
    print(f"Analysis response: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\nMatch Score: {result['match_score']}%")
        print(f"Resume Skills: {result['resume_skills']}")
        print(f"Job Skills: {result['job_skills']}")
        print(f"Job Title: {result['job_title']}")
        print(f"Skill Gaps: {len(result['skill_gaps'])} gaps found")
        for gap in result['skill_gaps']:
            print(f"  - {gap['skill']} ({gap['level']})")
        print(f"Roadmap: {len(result['roadmap'])} items")
        for item in result['roadmap'][:3]:  # Show first 3 items
            print(f"  - Day {item['days']}: {item['skill']}")
    else:
        print(f"Error response: {response.text}")
        
except Exception as e:
    print(f"Error: {e}")