import axios from 'axios'
import { getAccessToken } from '../utils/authSession'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
})

client.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 회원가입 - 인증번호 전송
export const sendSms = (data) =>
  client.post('/api/v1/signup/sms-send', data)

// 회원가입 - 인증번호 인증
export const verifySms = (data) =>
  client.post('/api/v1/signup/sms-verify', data)

// 회원가입 - 초대코드 인증
export const verifyInviteCode = (data) =>
  client.post('/api/v1/signup/invite-verify', data)

// 보호자 회원가입
export const guardianSignup = (data) =>
  client.post('/api/v1/signup/guardian', data)

// 어르신 회원가입
export const elderSignup = (data) =>
  client.post('/api/v1/signup/elder', data)

// 로그인
export const login = (data) =>
  client.post('/api/v1/auth/login', data)

// Access Token 재발급
export const reissueToken = (data) =>
  client.post('/api/v1/auth/refresh', data)

// 개인정보 변경
export const updateProfile = (data) =>
  client.patch('/api/v1/account/modify', data)

// 비밀번호 재설정
export const resetPassword = (data) =>
  client.patch('/api/v1/auth/password-reset', data)

// 로그아웃
export const logout = () =>
  client.post('/api/v1/auth/logout')

// 회원탈퇴
export const deleteAccount = () =>
  client.delete('/api/v1/account/withdraw')
