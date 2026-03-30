import { useState, useRef } from 'react'
import { useAnalysis } from '../context/AnalysisContext'
import MatchGauge from '../components/MatchGauge'
import JobsPanel from '../components/JobsPanel'
import Roadmap from '../components/Roadmap'

export default function Dashboard() {
  const [resumeFile, setResumeFile] = useState(null)
  const [jobText, setJobText] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const { result, setResult, loading, setLoading, error, setError } = useAnalysis()

  const handleFileDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) setResumeFile(file)
  }

  const handleAnalyze = async () => {
    if (!resumeFile || !jobText.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Step 1: upload resume → get text
      const formData = new FormData()
      formData.append('file', resumeFile)
      const uploadRes = await fetch('/api/resume/upload', { method: 'POST', body: formData })
      if (!uploadRes.ok) throw new Error('Resume upload failed')
      const { resume_text } = await uploadRes.json()

      // Step 2: full analysis
      const analysisRes = await fetch('/api/analyze/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text, job_text: jobText }),
      })
      if (!analysisRes.ok) throw new Error('Analysis failed')
      const data = await analysisRes.json()
      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const canAnalyze = resumeFile && jobText.trim().length > 0 && !loading

  return (
    <main className="pt-32 pb-20 px-8 max-w-[1600px] mx-auto dot-grid min-h-screen">

      {/* Input Section */}
      <div className="grid grid-cols-12 gap-12 items-start mb-8 relative">

        {/* Left: Resume Upload */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[1rem] shadow-[0_40px_40px_-15px_rgba(47,51,50,0.04)] border border-[#afb3b0]/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#d2e8d4] rounded-[1rem] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#506454]">upload_file</span>
              </div>
              <h2 className="font-['Newsreader'] text-2xl font-semibold">Upload Resume</h2>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleFileDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              className={`border-2 border-dashed rounded-[1rem] p-10 text-center cursor-pointer transition-all
                ${dragOver
                  ? 'border-[#506454] bg-[#d2e8d4]/30'
                  : resumeFile
                    ? 'border-[#506454]/40 bg-[#d2e8d4]/10'
                    : 'border-[#afb3b0]/30 bg-[#f3f4f2] hover:bg-[#d2e8d4]/20'}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => setResumeFile(e.target.files[0] || null)}
              />
              {resumeFile ? (
                <>
                  <span className="material-symbols-outlined text-4xl text-[#506454] mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>task</span>
                  <p className="text-sm font-medium text-[#506454]">{resumeFile.name}</p>
                  <p className="text-xs text-[#5c605e] mt-1">Click to replace</p>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl text-[#777c79] mb-3 block">description</span>
                  <p className="text-sm text-[#5c605e]">Drag & drop or click to upload</p>
                  <p className="text-xs text-[#afb3b0] mt-1">PDF or DOCX</p>
                </>
              )}
            </div>
          </div>

          {/* Pipeline badges */}
          <div className="flex items-center gap-6 pl-8">
            <div className={`w-1 h-12 ${resumeFile ? 'bg-[#506454]' : 'bg-[#afb3b0]/40'}`} />
            <div className="bg-[#e6e9e6] px-6 py-4 rounded-full flex items-center gap-3">
              <span className={`material-symbols-outlined text-sm ${resumeFile ? 'text-[#506454]' : 'text-[#afb3b0]'}`}>settings_suggest</span>
              <span className="text-xs font-['Inter'] font-medium tracking-widest uppercase">Resume Parser</span>
            </div>
          </div>
          <div className="flex items-center gap-6 pl-8">
            <div className={`w-1 h-12 ${resumeFile ? 'bg-[#506454]/50' : 'bg-[#afb3b0]/20'}`} />
            <div className="bg-[#e6e9e6] px-6 py-4 rounded-full flex items-center gap-3">
              <span className={`material-symbols-outlined text-sm ${resumeFile ? 'text-[#506454]' : 'text-[#afb3b0]'}`}>psychology</span>
              <span className="text-xs font-['Inter'] font-medium tracking-widest uppercase">Skill Extractor</span>
            </div>
          </div>
        </div>

        {/* Center: Engine */}
        <div className="col-span-12 lg:col-span-4 flex flex-col items-center justify-center relative pt-4">
          <div className="absolute inset-0 -z-10 pointer-events-none hidden lg:block">
            <svg className="w-full h-full" viewBox="0 0 400 400">
              <path d="M 50 150 L 150 200" fill="none" stroke="#afb3b0" strokeWidth="0.5" />
              <path d="M 350 150 L 250 200" fill="none" stroke="#afb3b0" strokeWidth="0.5" />
              <path d="M 200 300 L 200 380" fill="none" stroke="#afb3b0" strokeWidth="0.5" />
            </svg>
          </div>

          <div className={`hex-container w-72 h-80 flex flex-col items-center justify-center text-center p-8 text-[#f9f9f7] shadow-2xl transition-all duration-500
            ${loading ? 'bg-[#506454]' : 'bg-[#2f3332]'}`}>
            <span
              className={`material-symbols-outlined text-[#c4dac6] text-5xl mb-4 ${loading ? 'animate-spin' : ''}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {loading ? 'autorenew' : 'hub'}
            </span>
            <h3 className="font-['Newsreader'] text-2xl italic mb-2">
              {loading ? 'Analyzing...' : 'Matching Engine'}
            </h3>
            <p className="text-xs font-['Inter'] tracking-widest uppercase text-[#e0e3e0]/70">
              {loading ? 'Please wait' : 'Gap Analyzer v.4.0'}
            </p>
          </div>

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className={`mt-8 px-8 py-3 rounded-full font-['Inter'] text-xs tracking-[0.2em] uppercase transition-all duration-300
              ${canAnalyze
                ? 'bg-[#506454] text-[#e8ffea] hover:opacity-90 cursor-pointer shadow-lg'
                : 'bg-[#afb3b0]/30 text-[#afb3b0] cursor-not-allowed'}`}
          >
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>

        {/* Right: Job Description */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[1rem] shadow-[0_40px_40px_-15px_rgba(47,51,50,0.04)] border border-[#afb3b0]/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#e5e2e1] rounded-[1rem] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#605f5f]">assignment</span>
              </div>
              <h2 className="font-['Newsreader'] text-2xl font-semibold">Paste Job Description</h2>
            </div>
            <textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              className="w-full h-40 bg-[#f3f4f2] border-none focus:outline-none focus:ring-2 focus:ring-[#506454]/40 rounded-[1rem] p-4 font-['Inter'] text-sm text-[#5c605e] resize-none"
              placeholder="Paste the job description from LinkedIn, Indeed, or any job board..."
            />
            <p className="text-xs text-[#afb3b0] mt-2 text-right">{jobText.length} chars</p>
          </div>

          <div className="flex items-center gap-6 justify-end pr-8">
            <div className="bg-[#e6e9e6] px-6 py-4 rounded-full flex items-center gap-3">
              <span className="text-xs font-['Inter'] font-medium tracking-widest uppercase">Job Parser</span>
              <span className={`material-symbols-outlined text-sm ${jobText.trim() ? 'text-[#605f5f]' : 'text-[#afb3b0]'}`}>data_object</span>
            </div>
            <div className={`w-1 h-12 ${jobText.trim() ? 'bg-[#605f5f]' : 'bg-[#afb3b0]/40'}`} />
          </div>
          <div className="flex items-center gap-6 justify-end pr-8">
            <div className="bg-[#e6e9e6] px-6 py-4 rounded-full flex items-center gap-3">
              <span className="text-xs font-['Inter'] font-medium tracking-widest uppercase">Requirements Map</span>
              <span className={`material-symbols-outlined text-sm ${jobText.trim() ? 'text-[#605f5f]' : 'text-[#afb3b0]'}`}>account_tree</span>
            </div>
            <div className={`w-1 h-12 ${jobText.trim() ? 'bg-[#605f5f]/50' : 'bg-[#afb3b0]/20'}`} />
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-[#fa746f]/10 rounded-[1rem] text-[#a83836] mb-8">
          <span className="material-symbols-outlined">error</span>
          <span className="text-sm font-['Inter']">{error}</span>
        </div>
      )}

      {/* Results Panel — only shown after analysis */}
      {result && (
        <div className="mt-12 bg-[#e0e3e0] p-1 lg:p-12 rounded-[1rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none select-none">
            <span className="font-['Newsreader'] text-9xl italic font-bold">Strategy</span>
          </div>
          <div className="relative z-10 space-y-8">
            {/* Row 1: Gauge+Gaps | Jobs */}
            <div className="grid grid-cols-12 gap-8">
              <MatchGauge score={result.match_score} gaps={result.skill_gaps} />
              <JobsPanel jobTitle={result.job_title} />
            </div>
            {/* Row 2: Roadmap full width */}
            <div className="grid grid-cols-12">
              <Roadmap plan={result.roadmap} />
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
