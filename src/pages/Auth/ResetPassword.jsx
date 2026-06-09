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
  const [notices, setNotices] = useState({})
  const [submitError, setSubmitError] = useState('')

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
    setNotices((prev) => ({ ...prev, [key]: '' }))
    setSubmitError('')
  }

  const getApiMessage = (err, fallback) => {
    return err?.response?.data?.message || fallback
  }

  const handleSendSms = async () => {
    if (!/^01[0-9]{8,9}$/.test(form.phone)) {
      setErrors((prev) => ({ ...prev, phone: '올바른 전화번호를 입력해주세요.' }))
      return
    }

    try {
      const res = await sendSms({ phone: form.phone })
      const verificationCode = res.data?.result?.verification_code
      if (verificationCode) {
        setForm((prev) => ({ ...prev, code: verificationCode }))
        setNotices((prev) => ({
          ...prev,
          phone: '개발용 인증번호가 발급되었습니다.',
          code: '인증번호가 자동 입력되었습니다. 확인을 눌러주세요.',
        }))
      } else {
        setNotices((prev) => ({ ...prev, phone: '인증번호가 전송되었습니다.' }))
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, phone: getApiMessage(err, '인증번호 전송에 실패했습니다.') }))
    }
  }

  const handleVerifySms = async () => {
    if (!/^01[0-9]{8,9}$/.test(form.phone)) {
      setErrors((prev) => ({ ...prev, phone: '올바른 전화번호를 입력해주세요.' }))
      return
    }
    if (!/^\d{6}$/.test(form.code)) {
      setErrors((prev) => ({ ...prev, code: '인증번호 6자리를 입력해주세요.' }))
      return
    }

    try {
      await verifySms({ phone: form.phone, code: form.code })
      setNotices((prev) => ({ ...prev, code: '전화번호 인증이 완료되었습니다.' }))
    } catch (err) {
      setErrors((prev) => ({ ...prev, code: getApiMessage(err, '인증번호 확인에 실패했습니다.') }))
    }
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
    setSubmitError('')

    try {
      await resetPassword({ phone: form.phone, new_password: form.newPassword })
      navigate('/login')
    } catch (err) {
      setSubmitError(getApiMessage(err, '비밀번호 재설정에 실패했습니다. 입력 정보를 다시 확인해주세요.'))
    }
  }

  return (
    <main className="auth-page auth-page--form auth-page--reset">
      <button className="auth-back-button" onClick={() => navigate(-1)} aria-label="뒤로가기">
        <img src={back} alt="" />
      </button>
      <h1 className='mt-6 font-semibold text-[22px]'>비밀번호 재설정</h1>
      <div className='mt-9 flex flex-col gap-5'>
        <Input
          title={"전화번호 입력"}
          placeholder={"전화번호를 입력해주세요"}
          value={form.phone}
          onChange={handleChange('phone')}
          buttonText="전송"
          onClick={handleSendSms}
          error={errors.phone}
          notice={notices.phone}
        />
        <Input
          title={"전화번호 인증"}
          placeholder={"문자 인증번호를 입력해주세요"}
          value={form.code}
          onChange={handleChange('code')}
          onClick={handleVerifySms}
          error={errors.code}
          notice={notices.code}
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
      <div className="auth-reset-action">
        {submitError && (
          <p className="mb-3 rounded-xl bg-[#FFF3EE] px-3 py-2 text-[13px] font-semibold text-[#FF6E61]">
            {submitError}
          </p>
        )}
        <Button title={"비밀번호 재설정"} main onClick={handleSubmit} />
      </div>
    </main>
  )
}
