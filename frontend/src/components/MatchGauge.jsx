// Circular SVG gauge + skill gaps stacked below
export default function MatchGauge({ score = 0, gaps = [] }) {
  const radius = 88
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const scoreLabel =
    score >= 80 ? 'Strong match — apply now'
    : score >= 60 ? 'Good match — close the gaps'
    : 'Needs work — focus on learning'

  return (
    <div className="col-span-12 md:col-span-4 bg-white rounded-[1rem] p-8 shadow-sm flex flex-col gap-8">

      {/* Gauge */}
      <div className="flex flex-col items-center">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192">
            <circle cx="96" cy="96" r={radius} fill="transparent" stroke="#f3f4f2" strokeWidth="10" />
            <circle
              cx="96" cy="96" r={radius} fill="transparent"
              stroke="#506454" strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-['Newsreader'] text-5xl font-bold text-[#2f3332]">{score}%</span>
            <span className="font-['Inter'] text-[10px] tracking-widest uppercase text-[#5c605e]">Match Score</span>
          </div>
        </div>
        <p className="mt-4 text-xs text-center text-[#5c605e] italic">{scoreLabel}</p>
      </div>

      {/* Skill gaps below gauge */}
      {gaps.length > 0 && (
        <div>
          <h4 className="font-['Newsreader'] text-base mb-3 flex items-center gap-2 text-[#2f3332]">
            <span className="material-symbols-outlined text-[#a83836] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>priority_high</span>
            Skill Gaps
          </h4>
          <div className="space-y-2">
            {gaps.map(({ skill, level }) => {
              const isCritical = level === 'Critical'
              return (
                <div key={skill} className={`flex items-center justify-between px-3 py-2.5 rounded-[0.75rem] ${isCritical ? 'bg-[#fa746f]/10' : 'bg-[#f3f4f2]'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-xs ${isCritical ? 'text-[#a83836]' : 'text-[#586433]'}`}>
                      {isCritical ? 'close' : 'info'}
                    </span>
                    <span className="text-sm font-medium text-[#2f3332]">{skill}</span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-['Inter'] font-bold uppercase tracking-wider
                    ${isCritical ? 'bg-[#a83836]/10 text-[#a83836]' : 'bg-[#586433]/10 text-[#586433]'}`}>
                    {level}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
