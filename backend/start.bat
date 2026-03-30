@echo off
echo.
echo  Curator AI - Backend
echo  Starting FastAPI on http://localhost:8000
echo  Press Ctrl+C to stop
echo.
cd /d "%~dp0"
python -m uvicorn main:app --reload --port 8000 --log-level info
