import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import back from '../../assets/img/back.svg'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { login } from '../../api/auth'
import {
  getDefaultPathForRole,
  saveAuthSession,
} from '../../utils/authSession'

export default function Login() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ phone: '', password: '' })

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleLogin = async () => {
    try {
      const res = await login({ phone: form.phone, password: form.password })
      const { accessToken, refreshToken, role } = res.data.result
      const savedRole = saveAuthSession({ accessToken, refreshToken, role })

      if (!savedRole) {
        alert('사용자 역할을 확인할 수 없습니다.')
        return
      }

      navigate(getDefaultPathForRole(savedRole), { replace: true })
    } catch (error) {
      const message =
        error.response?.data?.message || '로그인에 실패했습니다. 입력 정보를 확인해주세요.'
      alert(message)
    }
  }

  return (
    <main className="auth-page auth-page--form">
      <button className="auth-back-button" onClick={() => navigate(-1)} aria-label="뒤로가기">
        <img src={back} alt="" />
      </button>
      <h1 className='mt-6 font-semibold text-[22px]'>로그인</h1>
      <div className='mt-12 flex flex-col gap-7'>
        <Input title={"전화번호 입력"} placeholder={"전화번호를 입력해주세요"} value={form.phone} onChange={handleChange('phone')} />
        <Input title={"비밀번호 입력"} placeholder={"비밀번호를 입력해주세요"} type="password" value={form.password} onChange={handleChange('password')} />
      </div>
      <div className="auth-bottom-actions">
        <Button title={"로그인"} main onClick={handleLogin} />
        <Button title={"비밀번호 재설정"} onClick={() => navigate('/reset-password')} />
      </div>
    </main>
  )
}
