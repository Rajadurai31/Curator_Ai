import { NavLink } from 'react-router-dom'

const links = [
  { label: 'Dashboard', to: '/' },
  { label: 'Learning', to: '/learning' },
  { label: 'Tracker', to: '/tracker' },
]

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#f9f9f7]/80 backdrop-blur-xl shadow-[0_40px_40px_-15px_rgba(47,51,50,0.04)]">
      <div className="flex justify-between items-center px-12 py-6 max-w-[1920px] mx-auto">
        <div className="text-2xl font-['Newsreader'] italic text-[#222222]">Curator AI</div>

        <div className="hidden md:flex gap-10">
          {links.map(({ label, to }) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {({ isActive }) => (
                <span className={`font-['Newsreader'] italic text-lg tracking-tight transition-colors duration-300 cursor-pointer
                  ${isActive
                    ? 'text-[#506454] border-b-2 border-[#506454] pb-1'
                    : 'text-[#2f3332]/60 hover:text-[#506454]'}`}>
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        <div className="w-10 h-10 rounded-full bg-[#e5e2e1] overflow-hidden">
          <div className="w-full h-full bg-[#506454]/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#506454]">person</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
