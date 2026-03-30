@echo off
echo.
echo  Curator AI — Backend
echo  ─────────────────────────────────────
echo  Starting FastAPI on http://localhost:8000
echo  Docs: http://localhost:8000/docs
echo  Press Ctrl+C to stop
echo  ─────────────────────────────────────
echo.
python -m uvicorn main:app --reload --port 8000 --log-level info
