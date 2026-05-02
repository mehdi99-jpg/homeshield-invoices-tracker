import { useState, useEffect, useCallback } from 'react'

export function useApi(apiCall, deps = [], immediate = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiCall(...args)
      setData(response.data)
      return response.data
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur inconnue')
      throw err
    } finally {
      setLoading(false)
    }
  }, deps)

  const refetch = useCallback((...args) => execute(...args), [execute])

  useEffect(() => {
    if (immediate) execute()
  }, [execute, immediate])

  return { data, loading, error, refetch, setData }
}
