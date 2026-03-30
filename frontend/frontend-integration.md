# Curator AI — Frontend Integration Plan

> All data in the React app is currently hardcoded/static. These steps wire each page and component to the live FastAPI backend once it's running.

---

## Prerequisites

Backend must be running at `http://localhost:8000` before starting any step here.  
Vite proxy configured ✅ — all `/api/*` calls forward to `http://localhost:8000`.

```js
// vite.config.js
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
```

---

## Step 1 — Global State (Analysis Context)

**Status:** ✅ Done  
**File:** `src/context/AnalysisContext.jsx`

Create a React context to share the analysis result across all three pages without prop-drilling.

```jsx
import { createContext, useContext, useState } from 'react'

const AnalysisContext = createContext(null)

export function AnalysisProvider({ children }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  return (
    <AnalysisContext.Provider value={{ result, setResult, loading, setLoading, error, setError }}>
      {children}
    </AnalysisContext.Provider>
  )
}

export const useAnalysis = () => useContext(AnalysisContext)
```

Wrap `<App />` with `<AnalysisProvider>` in `src/main.jsx`.

---

## Step 2 — Dashboard: Resume Upload

**Status:** ✅ Done  
**File:** `src/pages/Dashboard.jsx`  
**Replaces:** Static drag-and-drop UI (no file handling)

Add `useState` for the selected file and display the filename once chosen.

```jsx
const [resumeFile, setResumeFile] = useState(null)

// In the drop zone:
<div
  onClick={() => document.getElementById('resume-input').click()}
  onDrop={(e) => { e.preventDefault(); setResumeFile(e.dataTransfer.files[0]) }}
  onDragOver={(e) => e.preventDefault()}
>
  <input
    id="resume-input" type="file" accept=".pdf,.docx"
    className="hidden"
    onChange={(e) => setResumeFile(e.target.files[0])}
  />
  {resumeFile
    ? <p className="text-sm text-[#506454] font-medium">{resumeFile.name}</p>
    : <p className="text-sm text-[#5c605e]">Drag and drop your PDF or DOCX here</p>
  }
</div>
```

---

## Step 3 — Dashboard: Job Description Input

**Status:** ✅ Done  
**File:** `src/pages/Dashboard.jsx`  
**Replaces:** Uncontrolled `<textarea>`

```jsx
const [jobText, setJobText] = useState('')

<textarea
  value={jobText}
  onChange={(e) => setJobText(e.target.value)}
  placeholder="Paste the text from the LinkedIn or Indeed posting..."
/>
```

---

## Step 4 — Dashboard: Analyze Button + API Call

**Status:** ✅ Done  
**File:** `src/pages/Dashboard.jsx`  
**Calls:** `POST /api/resume/upload` then `POST /api/analyze/full`

Add an "Analyze" button below the two input panels. On click, upload the resume, then run the full analysis.

```jsx
const { setResult, setLoading, setError } = useAnalysis()

const handleAnalyze = async () => {
  if (!resumeFile || !jobText.trim()) return
  setLoading(true)
  setError(null)
  try {
    // 1. Parse resume file → text
    const formData = new FormData()
    formData.append('file', resumeFile)
    const { resume_text } = await fetch('/api/resume/upload', {
      method: 'POST', body: formData,
    }).then(r => r.json())

    // 2. Full analysis
    const data = await fetch('/api/analyze/full', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume_text, job_text: jobText }),
    }).then(r => r.json())

    setResult(data)
  } catch (err) {
    setError('Analysis failed. Check the backend is running.')
  } finally {
    setLoading(false)
  }
}
```

Add a loading state indicator on the Matching Engine hex while the request is in flight.

---

## Step 5 — Dashboard: Wire Result Components

**Status:** ✅ Done  
**File:** `src/pages/Dashboard.jsx`  
**Replaces:** Hardcoded props on `MatchGauge`, `SkillGaps`, `Roadmap`

```jsx
const { result, loading } = useAnalysis()

// Pass live data — fall back to defaults while no result yet
<MatchGauge score={result?.match_score ?? 0} />
<SkillGaps  gaps={result?.skill_gaps   ?? []} />
<Roadmap    plan={result?.roadmap      ?? []} />
```

Show the results panel only after a result exists:

```jsx
{result && (
  <div className="mt-20 bg-[#e0e3e0] ...">
    {/* MatchGauge + SkillGaps + Roadmap */}
  </div>
)}
```

---

## Step 6 — Learning Page: Live Roadmap

**Status:** ✅ Done  
**File:** `src/pages/Learning.jsx`  
**Replaces:** Hardcoded `weekPlan` array

```jsx
import { useAnalysis } from '../context/AnalysisContext'

const { result } = useAnalysis()
const weekPlan = result?.roadmap ?? []

// If no result yet, show an empty state prompt
if (!weekPlan.length) {
  return (
    <main className="pt-32 pb-20 px-8 ...">
      <p className="text-[#5c605e] text-center mt-20">
        Complete an analysis on the Dashboard to generate your roadmap.
      </p>
    </main>
  )
}
```

The rest of the page renders unchanged — `weekPlan` now comes from the API.

---

## Step 7 — Tracker Page: Live Skill Bars

**Status:** ✅ Done  
**File:** `src/pages/Tracker.jsx`  
**Replaces:** Hardcoded `skills` and `applications` arrays

Map `result.resume_skills` (array of strings) into the shape the skill bars expect:

```jsx
const { result } = useAnalysis()

const gapSkillNames = new Set(
  (result?.skill_gaps ?? []).map(g => g.skill.toLowerCase())
)

const skills = (result?.resume_skills ?? []).map((name, i) => ({
  name,
  // Placeholder proficiency — replace with real scores when backend provides them
  level: Math.max(20, 95 - i * 8),
  category: 'Extracted',
  gap: gapSkillNames.has(name.toLowerCase()),
}))
```

Show an empty state if no result yet, same pattern as Learning page.

---

## Step 8 — Loading & Error States

**Status:** ✅ Done (inline in Dashboard.jsx — error banner + hex spinner)  
**File:** `src/pages/Dashboard.jsx`

Reusable banner shown during loading or on error, used by Dashboard.

```jsx
export default function AnalysisStatus({ loading, error }) {
  if (loading) return (
    <div className="flex items-center gap-3 p-4 bg-[#d2e8d4] rounded-[1rem] text-[#435647]">
      <span className="material-symbols-outlined animate-spin">autorenew</span>
      <span className="text-sm font-['Inter']">Analyzing your profile — this takes ~15 seconds...</span>
    </div>
  )
  if (error) return (
    <div className="flex items-center gap-3 p-4 bg-[#fa746f]/10 rounded-[1rem] text-[#a83836]">
      <span className="material-symbols-outlined">error</span>
      <span className="text-sm font-['Inter']">{error}</span>
    </div>
  )
  return null
}
```

---

## Component → API Field Mapping

| Component / Page | Hardcoded value | API field from `/api/analyze/full` |
|---|---|---|
| `MatchGauge` | `score={85}` | `result.match_score` |
| `SkillGaps` | `defaultGaps` array | `result.skill_gaps` |
| `Roadmap` | `defaultPlan` array | `result.roadmap` |
| `Learning.jsx` | `weekPlan` const | `result.roadmap` |
| `Tracker.jsx` | `skills` const | `result.resume_skills` mapped |
| `Tracker.jsx` | `applications` const | future: `/api/applications` |

---

## Implementation Order

| # | Step | Effort |
|---|------|--------|
| 1 | Global AnalysisContext | ~20 min |
| 2 | Resume file upload input | ~30 min |
| 3 | Job description controlled input | ~10 min |
| 4 | Analyze button + API call | ~45 min |
| 5 | Wire MatchGauge / SkillGaps / Roadmap | ~20 min |
| 6 | Learning page live roadmap | ~20 min |
| 7 | Tracker page live skill bars | ~30 min |
| 8 | Loading & error states | ~30 min |
