import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

// ===== SESSION ENDPOINTS =====

export const createSession = (userId, name, description = '') => {
  return client.post('/sessions', { user_id: userId, name, description })
}

export const getSession = (sessionId) => {
  return client.get(`/sessions/${sessionId}`)
}

// ===== QUERY ENDPOINTS =====

export const createQuery = (sessionId, question, language = 'en', citationStyle = 'apa', wordCount = 1500, numHeadings = 5) => {
  return client.post('/queries', {
    session_id: sessionId,
    question,
    language,
    citation_style: citationStyle,
    word_count: wordCount,
    num_headings: numHeadings
  })
}

export const getQuery = (queryId) => {
  return client.get(`/queries/${queryId}`)
}

export const getReport = (queryId) => {
  return client.get(`/queries/${queryId}/report`)
}

// ===== COMBINED: start research (create session + query) =====

export const startResearch = async (query, language = 'en', citationStyle = 'apa', wordCount = 1500, numHeadings = 5) => {
  // Create session
  const { data: session } = await createSession('user', query.slice(0, 50))
  // Create query in that session
  const { data: queryData } = await createQuery(session.id, query, language, citationStyle, wordCount, numHeadings)
  return { data: { session_id: session.id, query_id: queryData.id } }
}

// ===== UTILITY =====

export const healthCheck = () => {
  return axios.get('/health')
}

export const exportReport = (queryId, format = 'docx') => {
  return client.post(`/export/${queryId}`, { format }, { responseType: 'blob' })
}

export default client
