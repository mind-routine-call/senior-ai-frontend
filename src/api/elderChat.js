import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const unwrapResult = (response) => response.data?.result ?? response.data

export const getElderHome = async (elderId = 1) => {
  const response = await client.get('/api/v1/elders/me/home', {
    params: { elder_id: elderId },
  })
  return unwrapResult(response)
}

export const completeElderOnboarding = async (elderId = 1) => {
  const response = await client.patch('/api/v1/elders/me/onboarding-complete', {
    elder_id: elderId,
    onboarding_completed: true,
  })
  return unwrapResult(response)
}

export const startChatSession = async ({ elderId = 1, scenarioId, scheduleId }) => {
  const response = await client.post('/api/v1/chats/start', {
    elder_id: elderId,
    scenario_id: scenarioId,
    schedule_id: scheduleId,
  })
  return unwrapResult(response)
}

export const saveChatTurn = async (callId, payload) => {
  const response = await client.post(`/api/v1/chats/${callId}/turns`, payload)
  return unwrapResult(response)
}

export const saveUtteranceAnalysis = async (turnId, payload) => {
  const response = await client.post(`/api/v1/chats/turns/${turnId}/utterance-analysis`, payload)
  return unwrapResult(response)
}

export const endChatSession = async (callId, endedReason = 'NORMAL') => {
  const response = await client.patch(`/api/v1/chats/${callId}/end`, {
    ended_reason: endedReason,
  })
  return unwrapResult(response)
}
