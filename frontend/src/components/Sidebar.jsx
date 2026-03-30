import { NavLink } from 'react-router-dom'

const navItems = [
  { icon: 'dashboard', label: 'Overview', to: '/' },
  { icon: 'auto_stories', label: 'Learning', to: '/learning' },
  { icon: 'shutter_speed', label: 'Skill Gap', to: '/tracker' },
]

export default function Sidebar() {
  return (
    <aside className="hidden xl:flex flex-col py-10 h-screen w-72 fixed left-0 top-0 bg-[#e0e3e0] z-40">
      <div className="px-10 mb-12">
        <div className="text-xl font-['Newsreader'] text-[#222222]">The Curator</div>
        <div className="text-[10px] font-['Inter'] tracking-widest uppercase text-[#506454] mt-1">AI Career Strategist</div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map(({ icon, label, to }) => (
          <NavLink key={to} to={to} end={to === '/'}>
            {({ isActive }) => (
              <div className={`flex items-center gap-4 py-4 font-['Inter'] text-sm tracking-wide uppercase cursor-pointer transition-all
                ${isActive
                  ? 'bg-[#f9f9f7] text-[#506454] rounded-l-full ml-4 pl-6'
                  : 'text-[#2f3332]/70 pl-10 hover:bg-[#f9f9f7]/50'}`}>
                <span className="material-symbols-outlined">{icon}</span>
                <span>{label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-10 mt-auto pt-10 space-y-4">
        <div className="flex items-center gap-3 text-[#5c605e]/70 cursor-pointer hover:text-[#506454] transition-colors">
          <span className="material-symbols-outlined text-sm">help_outline</span>
          <span className="text-xs uppercase tracking-tighter">Support</span>
        </div>
        <div className="flex items-center gap-3 text-[#5c605e]/70 cursor-pointer hover:text-[#506454] transition-colors">
          <span className="material-symbols-outlined text-sm">logout</span>
          <span className="text-xs uppercase tracking-tighter">Sign Out</span>
        </div>
      </div>
    </aside>
  )
}
