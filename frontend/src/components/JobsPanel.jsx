import { useState, useEffect } from 'react'

// Fetches live jobs from RapidAPI based on the job title extracted from analysis
export default function JobsPanel({ jobTitle = '' }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!jobTitle) return

    const fetchJobs = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/jobs/search?query=${encodeURIComponent(jobTitle)}&location=Remote&page=1`)
        if (!res.ok) throw new Error('Job search failed')
        const data = await res.json()
        setJobs(data.jobs.slice(0, 5))  // top 5
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [jobTitle])

  return (
    <div className="col-span-12 md:col-span-8 bg-white rounded-[1rem] p-8 shadow-sm">
      <h4 className="font-['Newsreader'] text-xl mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#506454]">work</span>
        Available Jobs
        {jobTitle && <span className="text-sm text-[#5c605e] font-normal ml-2">for {jobTitle}</span>}
      </h4>

      {loading && (
        <div className="flex items-center gap-3 p-4 bg-[#f3f4f2] rounded-[1rem] text-[#5c605e]">
          <span className="material-symbols-outlined animate-spin">autorenew</span>
          <span className="text-sm">Searching jobs...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-[#fa746f]/10 rounded-[1rem] text-[#a83836]">
          <span className="material-symbols-outlined">error</span>
          <span className="text-sm">{error}</span>
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <p className="text-sm text-[#5c605e] italic">No jobs found. Try a different search.</p>
      )}

      {!loading && jobs.length > 0 && (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="p-4 bg-[#f3f4f2] rounded-[1rem] hover:bg-[#d2e8d4]/20 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className="font-['Inter'] text-sm font-semibold text-[#2f3332] mb-1">{job.title}</h5>
                  <p className="text-xs text-[#5c605e]">{job.company} · {job.location}</p>
                </div>
                {job.logo && (
                  <img src={job.logo} alt="" className="w-8 h-8 rounded object-contain bg-white p-1" />
                )}
              </div>
              <p className="text-xs text-[#5c605e] line-clamp-2 mb-3">{job.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[9px] px-2 py-1 bg-[#e6e9e6] text-[#5c605e] rounded-full font-['Inter'] uppercase tracking-wider">
                  {job.type || 'Full-time'}
                </span>
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-['Inter'] text-[#506454] hover:underline flex items-center gap-1"
                  >
                    Apply
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
