import { useState, useEffect, useRef, useCallback } from 'react'
import { startResearch, getReport, getQuery } from '../api/client'

export function useResearch() {
  const [sessionId, setSessionId] = useState(null)
  const [queryId, setQueryId] = useState(null)
  const [status, setStatus] = useState('idle')
  const [traceEvents, setTraceEvents] = useState([])
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const pollRef = useRef(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const pollForCompletion = useCallback((qId) => {
    stopPolling()
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await getQuery(qId)
        // Update trace from status
        if (data.status === 'completed') {
          stopPolling()
          setStatus('done')
          try {
            const { data: reportData } = await getReport(qId)
            setReport(reportData.report)
          } catch (e) {
            setReport(null)
          }
        } else if (data.status === 'failed') {
          stopPolling()
          setStatus('failed')
          setError('Research pipeline failed')
        }
      } catch (e) {
        // keep polling
      }
    }, 3000)
  }, [stopPolling])

  const submit = useCallback(async (query, language = 'en', citationStyle = 'apa') => {
    if (!query?.trim()) {
      setError('Please enter a research query')
      return null
    }

    setIsLoading(true)
    setStatus('running')
    setTraceEvents([])
    setReport(null)
    setError(null)

    try {
      const { data } = await startResearch(query, language, citationStyle)
      setSessionId(data.session_id)
      setQueryId(data.query_id)

      // Add initial trace event
      setTraceEvents([{ agent: 'system', status: 'running', message: 'Research pipeline started...', id: 'start' }])

      // Poll for completion
      pollForCompletion(data.query_id)

      setIsLoading(false)
      return data.session_id
    } catch (err) {
      setStatus('failed')
      setError(err.response?.data?.detail || err.message || 'Failed to start research')
      setIsLoading(false)
      return null
    }
  }, [pollForCompletion])

  const cancel = useCallback(() => {
    stopPolling()
    setStatus('idle')
    setSessionId(null)
    setQueryId(null)
    setTraceEvents([])
    setReport(null)
  }, [stopPolling])

  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  return { submit, cancel, status, traceEvents, report, error, sessionId, queryId, isLoading }
}
