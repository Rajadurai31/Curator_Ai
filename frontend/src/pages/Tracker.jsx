import { useAnalysis } from '../context/AnalysisContext'
import { useNavigate } from 'react-router-dom'

const statusColors = {
  Applied:    'bg-[#d2e8d4] text-[#435647]',
  Interview:  'bg-[#eefdbe] text-[#445021]',
  Reviewing:  'bg-[#e5e2e1] text-[#525151]',
}

export default function Tracker() {
  const { result } = useAnalysis()
  const navigate = useNavigate()

  if (!result) {
    return (
      <main className="pt-32 pb-20 px-8 max-w-[1600px] mx-auto dot-grid min-h-screen flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-[#afb3b0] mb-6">shutter_speed</span>
        <h2 className="font-['Newsreader'] text-2xl text-[#2f3332] mb-3">No data yet</h2>
        <p className="text-[#5c605e] font-['Inter'] text-sm mb-8 text-center max-w-sm">
          Run an analysis on the Dashboard to see your skill proficiency and gap breakdown here.
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

  const gapNames = new Set((result.skill_gaps ?? []).map(g => g.skill.toLowerCase()))

  // Build skill rows from resume_skills — assign a rough proficiency level
  const skills = (result.resume_skills ?? []).map((name, i) => ({
    name,
    level: Math.max(25, 95 - i * 7),
    gap: gapNames.has(name.toLowerCase()),
  }))

  // Add gap skills that weren't in resume at all (level 0)
  ;(result.skill_gaps ?? []).forEach(({ skill }) => {
    if (!skills.find(s => s.name.toLowerCase() === skill.toLowerCase())) {
      skills.push({ name: skill, level: 5, gap: true })
    }
  })

  const stats = [
    { label: 'Match Score',   value: `${result.match_score ?? 0}%`, icon: 'hub',               bg: 'bg-[#d2e8d4]', color: 'text-[#506454]' },
    { label: 'Skills Found',  value: (result.resume_skills ?? []).length, icon: 'psychology',   bg: 'bg-[#eefdbe]', color: 'text-[#586433]' },
    { label: 'Gaps Found',    value: (result.skill_gaps ?? []).length,    icon: 'priority_high', bg: 'bg-[#fa746f]/10', color: 'text-[#a83836]' },
    { label: 'Plan Days',     value: (result.roadmap ?? []).length,       icon: 'calendar_month', bg: 'bg-[#e5e2e1]', color: 'text-[#605f5f]' },
  ]

  return (
    <main className="pt-32 pb-20 px-8 max-w-[1600px] mx-auto dot-grid min-h-screen">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-[#e5e2e1] text-[#525151] px-4 py-2 rounded-full text-xs font-['Inter'] tracking-widest uppercase mb-4">
          <span className="material-symbols-outlined text-sm">shutter_speed</span>
          Skill Tracker
        </div>
        <h1 className="font-['Newsreader'] text-4xl font-semibold text-[#2f3332] mb-2">Career Progress</h1>
        <p className="text-[#5c605e] font-['Inter']">Your skill profile based on the latest analysis.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon, bg, color }) => (
          <div key={label} className="bg-white rounded-[1rem] p-6 shadow-sm text-center">
            <div className={`w-10 h-10 ${bg} rounded-[0.75rem] flex items-center justify-center mx-auto mb-3`}>
              <span className={`material-symbols-outlined text-sm ${color}`}>{icon}</span>
            </div>
            <div className="font-['Newsreader'] text-3xl font-bold text-[#2f3332]">{value}</div>
            <div className="text-[10px] font-['Inter'] tracking-widest uppercase text-[#5c605e] mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Skill bars */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-[1rem] p-8 shadow-sm">
          <h3 className="font-['Newsreader'] text-xl mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#506454]">bar_chart</span>
            Skill Proficiency
          </h3>
          <div className="space-y-5">
            {skills.map(({ name, level, gap }) => (
              <div key={name}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#2f3332]">{name}</span>
                    {gap && (
                      <span className="text-[10px] px-2 py-0.5 bg-[#fa746f]/10 text-[#a83836] rounded-full font-['Inter'] uppercase tracking-wider font-bold">Gap</span>
                    )}
                  </div>
                  <span className="text-sm font-['Inter'] font-semibold text-[#506454]">{level}%</span>
                </div>
                <div className="h-2 bg-[#f3f4f2] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${gap ? 'bg-[#a83836]/60' : 'bg-[#506454]'}`}
                    style={{ width: `${level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill gaps detail */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-[1rem] p-8 shadow-sm">
          <h3 className="font-['Newsreader'] text-xl mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a83836]" style={{ fontVariationSettings: "'FILL' 1" }}>priority_high</span>
            Gaps to Close
          </h3>
          <div className="space-y-3">
            {(result.skill_gaps ?? []).map(({ skill, level }) => {
              const isCritical = level === 'Critical'
              return (
                <div key={skill} className={`flex items-center justify-between p-4 rounded-[1rem] ${isCritical ? 'bg-[#fa746f]/10' : 'bg-[#f3f4f2]'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-sm ${isCritical ? 'text-[#a83836]' : 'text-[#586433]'}`}>
                      {isCritical ? 'close' : 'info'}
                    </span>
                    <span className="text-sm font-medium text-[#2f3332]">{skill}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-['Inter'] font-bold uppercase tracking-wider
                    ${isCritical ? 'bg-[#a83836]/10 text-[#a83836]' : 'bg-[#586433]/10 text-[#586433]'}`}>
                    {level}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
