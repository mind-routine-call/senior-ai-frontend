import axios from 'axios'
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
} from '../utils/authSession'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const client = axios.create({
  baseURL: API_BASE_URL,
})
let refreshRequest = null

client.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const refreshToken = getRefreshToken()

    if (error.response?.status !== 401 || originalRequest?._retry || !refreshToken) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshRequest) {
        refreshRequest = axios
          .post(`${API_BASE_URL}/api/v1/auth/refresh`, { refreshToken })
          .then((response) => response.data?.result?.accessToken)
          .finally(() => {
            refreshRequest = null
          })
      }

      const accessToken = await refreshRequest
      if (!accessToken) {
        throw new Error('Access Token 재발급 응답이 없습니다.')
      }

      saveAccessToken(accessToken)
      originalRequest.headers = originalRequest.headers || {}
      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return client(originalRequest)
    } catch (refreshError) {
      clearAuthSession()
      if (typeof window !== 'undefined') {
        window.location.replace('/login')
      }
      return Promise.reject(refreshError)
    }
  },
)

const unwrapResult = (response) => response.data?.result ?? response.data

export const getElderHome = async () => {
  const response = await client.get('/api/v1/elders/me/home')
  return unwrapResult(response)
}

export const completeElderOnboarding = async () => {
  const response = await client.patch('/api/v1/elders/me/onboarding-complete', {
    onboarding_completed: true,
  })
  return unwrapResult(response)
}

export const startChatSession = async ({ scenarioId, scheduleId } = {}) => {
  const response = await client.post('/api/v1/chats/start', {
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
