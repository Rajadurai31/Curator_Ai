// Skill gap list with critical/secondary badges
export default function SkillGaps({ gaps = [] }) {
  const defaultGaps = [
    { skill: 'Distributed Systems (Kafka)', level: 'Critical' },
    { skill: 'GraphQL API Design', level: 'Secondary' },
    { skill: 'Project Leadership (Agile)', level: 'Secondary' },
  ]
  const items = gaps.length ? gaps : defaultGaps

  return (
    <div className="col-span-12 md:col-span-4 bg-white rounded-[1rem] p-8 shadow-sm">
      <h4 className="font-['Newsreader'] text-xl mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#a83836]" style={{ fontVariationSettings: "'FILL' 1" }}>priority_high</span>
        Skill Gaps Identified
      </h4>
      <div className="space-y-4">
        {items.map(({ skill, level }) => {
          const isCritical = level === 'Critical'
          return (
            <div key={skill} className={`flex items-center justify-between p-4 rounded-[1rem] ${isCritical ? 'bg-[#fa746f]/10' : 'bg-[#f3f4f2]'}`}>
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-sm ${isCritical ? 'text-[#a83836]' : 'text-[#586433]'}`}>
                  {isCritical ? 'close' : 'info'}
                </span>
                <span className="text-sm font-medium">{skill}</span>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold
                ${isCritical ? 'bg-[#a83836]/10 text-[#a83836]' : 'bg-[#586433]/10 text-[#586433]'}`}>
                {level}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
