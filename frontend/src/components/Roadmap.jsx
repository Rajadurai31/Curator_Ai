// 7-day learning roadmap timeline — used on Dashboard results panel
// API shape: [{ days, skill, tasks[], status: "in-progress"|"upcoming"|"locked" }]
export default function Roadmap({ plan = [] }) {
  if (!plan.length) return null

  return (
    <div className="col-span-12 bg-[#2f3332] rounded-[1rem] p-8 shadow-xl text-[#f9f9f7]">
      <h4 className="font-['Newsreader'] text-xl mb-8 flex items-center gap-2 italic">
        <span className="material-symbols-outlined text-[#c4dac6]">timeline</span>
        7-Day Skill Acquisition Roadmap
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {plan.map(({ days, skill, tasks = [], status }) => {
          const isActive = status === 'in-progress'
          const isLocked = status === 'locked'

          return (
          <div key={days} className={`rounded-[1rem] p-5 border ${isActive ? 'border-[#506454] bg-[#506454]/20' : isLocked ? 'border-[#e0e3e0]/10 bg-[#e0e3e0]/5 opacity-60' : 'border-[#e0e3e0]/10 bg-[#e0e3e0]/10'}`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <p className={`text-[10px] font-['Inter'] tracking-widest uppercase ${isActive ? 'text-[#c4dac6]' : 'text-[#e0e3e0]/50'}`}>{days}</p>
                <div className="flex items-center gap-1">
                  {isActive && <span className="w-2 h-2 rounded-full bg-[#506454] animate-pulse" />}
                  {isLocked && <span className="material-symbols-outlined text-[#e0e3e0]/40 text-sm">lock</span>}
                </div>
              </div>
              <h5 className="text-sm font-semibold mb-3">{skill}</h5>
              {/* Tasks */}
              {tasks.length > 0 && (
                <ul className="space-y-1.5">
                  {tasks.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-xs text-[#e0e3e0]/70">
                      <span className={`material-symbols-outlined text-xs mt-0.5 flex-shrink-0 ${isActive ? 'text-[#c4dac6]' : 'text-[#e0e3e0]/30'}`}>
                        radio_button_unchecked
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
