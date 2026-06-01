import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import back from '../../assets/img/back.svg'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { login } from '../../api/auth'

export default function Login() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ phone: '', password: '' })

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleLogin = async () => {
    const res = await login({ phone: form.phone, password: form.password })
    const { accessToken, refreshToken, role } = res.data.result
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    alert(`로그인 성공! 역할: ${role}`)
    // navigate('/report') // 로그인 후 이동할 페이지로 변경
  }

  return (
    <div>
      <button className='mt-[46px]' onClick={() => navigate(-1)}>
        <img src={back} alt="" />
      </button>
      <h1 className='mt-6 font-semibold text-[22px]'>로그인</h1>
      <div className='mt-14 flex flex-col gap-8'>
        <Input title={"전화번호 입력"} placeholder={"전화번호를 입력해주세요"} value={form.phone} onChange={handleChange('phone')} />
        <Input title={"비밀번호 입력"} placeholder={"비밀번호를 입력해주세요"} type="password" value={form.password} onChange={handleChange('password')} />
      </div>
      <div className='mt-[300px] flex flex-col gap-4 pb-[54px]'>
        <Button title={"로그인"} main onClick={handleLogin} />
        <Button title={"비밀번호 재설정"} onClick={() => navigate('/reset-password')} />
      </div>
    </div>
  )
}
