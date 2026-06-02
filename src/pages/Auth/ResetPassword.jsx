import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import back from '../../assets/img/back.svg'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { sendSms, verifySms, resetPassword } from '../../api/auth'

export default function ResetPassword() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    phone: '',
    code: '',
    newPassword: '',
    newPasswordConfirm: '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleSendSms = async () => {
    await sendSms({ phone: form.phone })
  }

  const handleVerifySms = async () => {
    await verifySms({ phone: form.phone, code: form.code })
  }

  const validate = () => {
    const newErrors = {}
    if (form.newPassword.length < 8) newErrors.newPassword = '비밀번호는 8자 이상이어야 합니다.'
    if (form.newPassword !== form.newPasswordConfirm) newErrors.newPasswordConfirm = '비밀번호가 일치하지 않습니다.'
    return newErrors
  }

  const handleSubmit = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    await resetPassword({ phone: form.phone, new_password: form.newPassword })
    navigate('/login')
  }

  return (
    <div>
      <button className='mt-[46px]' onClick={() => navigate(-1)}>
        <img src={back} alt="" />
      </button>
      <h1 className='mt-6 font-semibold text-[22px]'>비밀번호 재설정</h1>
      <div className='mt-14 flex flex-col gap-8'>
        <Input
          title={"전화번호 입력"}
          placeholder={"전화번호를 입력해주세요"}
          value={form.phone}
          onChange={handleChange('phone')}
          buttonText="전송"
          onClick={handleSendSms}
        />
        <Input
          title={"전화번호 인증"}
          placeholder={"문자 인증번호를 입력해주세요"}
          value={form.code}
          onChange={handleChange('code')}
          onClick={handleVerifySms}
        />
        <Input
          title={"새 비밀번호 입력"}
          placeholder={"새 비밀번호를 입력해주세요"}
          type="password"
          value={form.newPassword}
          onChange={handleChange('newPassword')}
          error={errors.newPassword}
        />
        <Input
          title={"새 비밀번호 확인"}
          placeholder={"새 비밀번호를 다시 입력해주세요"}
          type="password"
          value={form.newPasswordConfirm}
          onChange={handleChange('newPasswordConfirm')}
          error={errors.newPasswordConfirm}
        />
      </div>
      <div className='mt-[75px]'>
        <Button title={"비밀번호 재설정"} main onClick={handleSubmit} />
      </div>
    </div>
  )
}
