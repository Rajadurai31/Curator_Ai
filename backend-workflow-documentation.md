# Curator AI Backend - Complete Workflow Documentation

## Overview

The Curator AI backend is a FastAPI-based service that provides intelligent resume-job matching, skill gap analysis, and personalized learning roadmaps. The system processes resumes and job descriptions using AI services to deliver comprehensive career guidance.

## Architecture

### Core Components

1. **FastAPI Application** (`main.py`) - Main server with CORS, logging, and startup hooks
2. **Service Layer** - AI-powered processing services
3. **Router Layer** - API endpoints organized by functionality
4. **Database Layer** - PostgreSQL persistence with SQLAlchemy
5. **Models** - Pydantic schemas for request/response validation

### Technology Stack

- **Framework**: FastAPI 0.115.0
- **AI/ML**: Groq LLM API, sentence-transformers
- **Database**: PostgreSQL (Neon) with SQLAlchemy ORM
- **File Processing**: pdfplumber, python-docx
- **External APIs**: RapidAPI JSearch for job listings

## Complete Workflow

### 1. Resume Processing Pipeline

#### Endpoint: `POST /api/resume/upload`
**File**: `routers/resume.py`

**Flow**:
1. Accepts PDF/DOCX file uploads (max 10MB)
2. Validates file type and size
3. Extracts text using appropriate parser
4. Returns plain text for further processing

**Service**: `services/resume_parser.py`
- **PDF Processing**: Uses `pdfplumber` to extract text from all pages
- **DOCX Processing**: Uses `python-docx` to extract text from paragraphs and tables
- **Error Handling**: Provides user-friendly error messages for common issues

### 2. Skill Extraction Service

#### Service: `services/skill_extractor.py`
**Purpose**: Extract structured skills from resume text using Groq LLM

**Process**:
1. Sends resume text (first 3000 chars) to Groq API
2. Uses `llama-3.1-8b-instant` model with JSON response format
3. Extracts: skills array, tools array, experience_years
4. Returns structured data for matching engine

**Prompt Engineering**:
```
You are a resume parser. Extract technical skills from the resume below.
Return ONLY valid JSON with this exact shape — no extra text:
{
  "skills": ["Python", "SQL"],
  "tools": ["Docker", "Git"],
  "experience_years": 3
}
```

### 3. Job Description Analysis

#### Service: `services/job_parser.py`
**Purpose**: Extract required skills from job descriptions

**Process**:
1. Analyzes job description text (first 3000 chars)
2. Uses Groq LLM to identify required vs nice-to-have skills
3. Extracts job title for context
4. Returns structured skill requirements

**Output Structure**:
```json
{
  "required_skills": ["Python", "AWS"],
  "nice_to_have": ["Kubernetes"],
  "job_title": "Backend Engineer"
}
```

### 4. Matching Engine

#### Service: `services/matching_engine.py`
**Purpose**: Calculate compatibility score between resume and job

**Algorithm**:
1. Uses sentence-transformers model `all-MiniLM-L6-v2`
2. Encodes skill lists as embeddings
3. Computes cosine similarity
4. Returns percentage match (0-100%)

**Model Loading**:
- Lazy loading with global caching
- Pre-loaded during server startup to avoid first-request timeout
- ~80MB model download on first run

### 5. Skill Gap Analysis

#### Service: `services/gap_analyzer.py`
**Purpose**: Identify missing skills and prioritize them

**Process**:
1. Performs case-insensitive set difference
2. Uses Groq LLM to classify gaps as "Critical" or "Secondary"
3. Returns prioritized list of missing skills

**Classification Logic**:
- **Critical**: Core requirements for the role
- **Secondary**: Nice-to-have or supporting skills

### 6. Learning Roadmap Generation

#### Service: `services/mentor_agent.py`
**Purpose**: Generate personalized 7-day learning plans

**Features**:
1. Uses `llama-3.3-70b-versatile` for better planning
2. Creates 3-5 roadmap entries covering 7 days
3. Groups related skills logically
4. Provides specific, actionable tasks
5. Sets appropriate status flags

**Status System**:
- First entry: `"in-progress"`
- Middle entries: `"upcoming"`
- Last entry: `"locked"`

### 7. Full Analysis Pipeline

#### Endpoint: `POST /api/analyze/full`
**File**: `routers/analysis.py`

**Complete Workflow**:
1. **Input Validation**: Ensures both resume and job text are provided
2. **Resume Analysis**: Extract skills, tools, experience
3. **Job Analysis**: Extract requirements and job title
4. **Matching**: Calculate compatibility score
5. **Gap Analysis**: Identify and prioritize missing skills
6. **Roadmap Generation**: Create learning plan
7. **Persistence**: Save session to database
8. **Response**: Return complete analysis

**Response Structure**:
```json
{
  "match_score": 75.2,
  "resume_skills": ["Python", "React", "SQL"],
  "job_skills": ["Python", "React", "Docker", "AWS"],
  "job_title": "Full Stack Developer",
  "skill_gaps": [
    {"skill": "Docker", "level": "Critical"},
    {"skill": "AWS", "level": "Critical"}
  ],
  "roadmap": [
    {
      "days": "Days 1-2",
      "skill": "Docker",
      "tasks": ["Install Docker", "Complete tutorial", "Build first container"],
      "status": "in-progress"
    }
  ]
}
```

### 8. Job Search Integration

#### Endpoint: `GET /api/jobs/search`
**File**: `routers/jobs_search.py`

**Features**:
- Integrates with RapidAPI JSearch
- Supports query and location parameters
- Returns simplified job listings
- Handles API errors gracefully

## Database Architecture

### Schema: `db/database.py`

**Table**: `analysis_sessions`
```sql
CREATE TABLE analysis_sessions (
    id SERIAL PRIMARY KEY,
    match_score FLOAT NOT NULL,
    resume_skills TEXT NOT NULL,  -- JSON array
    job_skills TEXT NOT NULL,     -- JSON array
    skill_gaps TEXT NOT NULL,     -- JSON array
    roadmap TEXT NOT NULL,        -- JSON array
    created_at VARCHAR(32) NOT NULL
);
```

**Connection Handling**:
- Uses pg8000 driver for better compatibility
- SSL configuration for Neon PostgreSQL
- Automatic table creation on startup
- Error handling for missing DATABASE_URL

## Issues Faced and Resolutions

### 1. SSL Connection Issues with Neon PostgreSQL

**Problem**: Default PostgreSQL drivers had SSL certificate validation issues with Neon's pooler.

**Solution**: 
- Switched to pg8000 driver
- Implemented custom SSL context with disabled certificate verification
- Parsed URL to extract SSL parameters properly

```python
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE   # Neon pooler uses self-signed cert
```

### 2. Model Loading Timeout

**Problem**: First API request would timeout while downloading the 80MB sentence-transformer model.

**Solution**:
- Implemented background model pre-loading during server startup
- Used threading to avoid blocking startup process
- Added proper error handling and logging

```python
def _preload():
    try:
        log.info("Pre-loading sentence-transformer model...")
        from services.matching_engine import _get_model
        _get_model()
        log.info("✅ Sentence-transformer model ready")
    except Exception as e:
        log.warning("⚠️  Model preload failed: %s", e)
threading.Thread(target=_preload, daemon=True).start()
```

### 3. File Upload Field Name Mismatch

**Problem**: Frontend and backend had different expectations for file upload field names.

**Solution**:
- Added detailed error logging to identify field names received
- Implemented helpful error messages showing expected vs received fields
- Added request debugging in upload endpoint

### 4. PDF Text Extraction Issues

**Problem**: Some PDFs (especially scanned documents) returned empty text.

**Solution**:
- Added comprehensive error handling with user-friendly messages
- Implemented page-by-page processing with warnings for empty pages
- Added validation to ensure extracted text is not empty
- Provided guidance for users with scanned PDFs

### 5. Groq API Rate Limiting and Errors

**Problem**: Occasional API failures and rate limiting.

**Solution**:
- Implemented proper error handling with HTTP status codes
- Added request logging for debugging
- Used appropriate temperature settings for consistent results
- Implemented JSON response format validation

### 6. CORS Configuration

**Problem**: Frontend couldn't access backend due to CORS restrictions.

**Solution**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 7. Environment Variable Management

**Problem**: Missing or incorrect environment variables causing service failures.

**Solution**:
- Implemented proper environment variable validation
- Added informative error messages for missing keys
- Used python-dotenv for consistent loading
- Added startup checks for critical variables

## Performance Optimizations

### 1. Model Caching
- Global model instance to avoid repeated loading
- Background pre-loading during startup
- Lazy initialization with proper error handling

### 2. Database Connection Management
- Connection pooling through SQLAlchemy
- Proper session management with context managers
- Non-blocking database saves

### 3. Request Processing
- Text truncation for API calls (3000 chars max)
- Efficient skill comparison using sets
- Minimal data transfer in API responses

## Monitoring and Logging

### Logging Strategy
- Structured logging with timestamps and log levels
- Request/response logging with timing information
- Service-specific loggers for better debugging
- Error logging with stack traces for failures

### Health Monitoring
- `/health` endpoint for service status
- Database connection validation
- API key validation during startup

## Testing Strategy

### Test Files Created
1. **`test_full_analysis.py`** - End-to-end pipeline testing
2. **`test_pdf_upload.py`** - PDF processing with generated content
3. **`test_upload.py`** - File upload validation testing

### Testing Approach
- Integration testing for complete workflows
- Error case validation
- File format compatibility testing
- API response validation

## Deployment Configuration

### Requirements
- Python 3.8+
- PostgreSQL database (Neon)
- Groq API key
- RapidAPI key (optional, for job search)

### Environment Variables
```env
DATABASE_URL=postgresql://...
GROQ_API_KEY=gsk_...
RAPID_API_KEY=... (optional)
```

### Startup Command
```bash
uvicorn main:app --reload --port 8000
```

## API Documentation

The backend automatically generates OpenAPI documentation available at:
- Interactive docs: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## Future Enhancements

### Potential Improvements
1. **Caching Layer**: Redis for frequently accessed data
2. **Async Processing**: Background job processing for heavy operations
3. **Rate Limiting**: API rate limiting for production use
4. **Authentication**: User authentication and session management
5. **Analytics**: Usage tracking and performance metrics
6. **Model Upgrades**: Support for newer/better AI models
7. **Batch Processing**: Multiple resume analysis
8. **Export Features**: PDF/Word report generation

### Scalability Considerations
- Horizontal scaling with load balancers
- Database read replicas for better performance
- CDN for static assets
- Container orchestration (Docker/Kubernetes)

## Conclusion

The Curator AI backend successfully implements a complete AI-powered career guidance system. The modular architecture allows for easy maintenance and feature additions, while the comprehensive error handling ensures reliable operation. The system effectively combines multiple AI services to provide valuable insights for job seekers.

The implementation demonstrates best practices in FastAPI development, proper error handling, and integration with external AI services. The documented issues and their resolutions provide valuable insights for similar projects.