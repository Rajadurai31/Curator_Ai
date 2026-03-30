import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnalysisProvider } from './context/AnalysisContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Learning from './pages/Learning'
import Tracker from './pages/Tracker'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AnalysisProvider>
        <div className="min-h-screen bg-[#f9f9f7]">
          <Navbar />
          <Sidebar />
          <div className="xl:pl-72">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/learning" element={<Learning />} />
              <Route path="/tracker" element={<Tracker />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </div>
        </div>
      </AnalysisProvider>
    </BrowserRouter>
  )
}

export default App
