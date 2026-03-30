import { useAnalysis } from '../context/AnalysisContext'
import { useNavigate } from 'react-router-dom'

const statusConfig = {
  'in-progress': { dot: 'bg-[#506454]', label: 'In Progress', badge: 'bg-[#d2e8d4] text-[#435647]' },
  'upcoming':    { dot: 'bg-[#e0e3e0]', label: 'Upcoming',    badge: 'bg-[#e6e9e6] text-[#5c605e]' },
  'locked':      { dot: 'bg-[#e0e3e0]', label: 'Locked',      badge: 'bg-[#e0e3e0] text-[#777c79]' },
}

export default function Learning() {
  const { result } = useAnalysis()
  const navigate = useNavigate()
  const weekPlan = result?.roadmap ?? []

  if (!weekPlan.length) {
    return (
      <main className="pt-32 pb-20 px-8 max-w-[1600px] mx-auto dot-grid min-h-screen flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-[#afb3b0] mb-6">auto_stories</span>
        <h2 className="font-['Newsreader'] text-2xl text-[#2f3332] mb-3">No roadmap yet</h2>
        <p className="text-[#5c605e] font-['Inter'] text-sm mb-8 text-center max-w-sm">
          Upload your resume and paste a job description on the Dashboard to generate your personalized 7-day learning plan.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-[#506454] text-[#e8ffea] px-6 py-3 rounded-full font-['Inter'] text-xs tracking-widest uppercase hover:opacity-90 transition-opacity"
        >
          Go to Dashboard
        </button>
      </main>
    )
  }

  const completed = weekPlan.filter(i => i.status === 'completed').length
  const progress = Math.round((completed / weekPlan.length) * 100)

  return (
    <main className="pt-32 pb-20 px-8 max-w-[1600px] mx-auto dot-grid min-h-screen">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-[#d2e8d4] text-[#435647] px-4 py-2 rounded-full text-xs font-['Inter'] tracking-widest uppercase mb-4">
          <span className="material-symbols-outlined text-sm">auto_stories</span>
          Learning Roadmap
        </div>
        <h1 className="font-['Newsreader'] text-4xl font-semibold text-[#2f3332] mb-2">Your 7-Day Skill Plan</h1>
        <p className="text-[#5c605e] font-['Inter']">Personalized based on your skill gap analysis.</p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-[1rem] p-6 mb-10 shadow-sm flex items-center gap-6">
        <div className="flex-1">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-['Inter'] font-medium text-[#2f3332]">Overall Progress</span>
            <span className="text-sm font-['Inter'] text-[#506454] font-semibold">{progress}%</span>
          </div>
          <div className="h-2 bg-[#f3f4f2] rounded-full overflow-hidden">
            <div className="h-full bg-[#506454] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="text-right">
          <div className="font-['Newsreader'] text-3xl font-bold text-[#2f3332]">{completed}/{weekPlan.length}</div>
          <div className="text-xs font-['Inter'] tracking-widest uppercase text-[#5c605e]">Complete</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-px before:bg-[#afb3b0]/40">
        {weekPlan.map(({ days, skill, tasks, status }) => {
          const cfg = statusConfig[status] ?? statusConfig['upcoming']
          return (
            <div key={days} className="relative">
              <div className={`absolute -left-8 top-6 w-6 h-6 rounded-full ${cfg.dot} border-4 border-[#f9f9f7] flex items-center justify-center`}>
                {status === 'in-progress' && <span className="w-1.5 h-1.5 rounded-full bg-[#e8ffea]" />}
              </div>
              <div className="bg-white rounded-[1rem] p-8 shadow-sm border border-[#afb3b0]/10 ml-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-['Inter'] tracking-widest uppercase text-[#5c605e] mb-1">{days}</p>
                    <h3 className="font-['Newsreader'] text-xl font-semibold text-[#2f3332]">{skill}</h3>
                  </div>
                  <span className={`text-[10px] px-3 py-1 rounded-full font-['Inter'] font-bold uppercase tracking-wider ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </div>
                <ul className="space-y-2">
                  {(tasks ?? []).map((t) => (
                    <li key={t} className="flex items-center gap-3 text-sm text-[#5c605e]">
                      <span className={`material-symbols-outlined text-sm ${status === 'in-progress' ? 'text-[#506454]' : 'text-[#afb3b0]'}`}>
                        radio_button_unchecked
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
                {status === 'in-progress' && (
                  <button className="mt-6 bg-[#506454] text-[#e8ffea] px-6 py-3 rounded-full font-['Inter'] text-xs tracking-widest uppercase hover:opacity-90 transition-opacity">
                    Start Learning
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
