import { createContext, useContext, useState } from 'react'

const AnalysisContext = createContext(null)

export function AnalysisProvider({ children }) {
  const [result, setResult] = useState(null)   // full API response
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  return (
    <AnalysisContext.Provider value={{ result, setResult, loading, setLoading, error, setError }}>
      {children}
    </AnalysisContext.Provider>
  )
}

export const useAnalysis = () => useContext(AnalysisContext)
