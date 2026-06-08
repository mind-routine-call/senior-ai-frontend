import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../../components/Button"
import Input from "../../components/Input"
import GenderToggle from "./components/GenderToggle"
import back from '../../assets/img/back.svg'
import { sendSms, verifySms, verifyInviteCode, guardianSignup, elderSignup } from '../../api/auth'

const PHONE_REGEX = /^01[0-9]{8,9}$/
const GENDER_MAP = { '남성': '남', '여성': '여' }

const GUARDIAN_GROUP = {
    gender: { title: "보호자" },
    fields: [
        { id: 1, title: "보호자 이름", placeholder: "보호자 이름을 입력해주세요", stateKey: "name" },
        { id: 2, title: "보호자 생년월일", placeholder: "YYYY-MM-DD", stateKey: "birth_date" },
        { id: 3, title: "보호자 전화번호", placeholder: "보호자 전화번호를 입력해주세요", stateKey: "phone", hasButton: true, buttonText: "전송", buttonType: "sendSms" },
        { id: 4, title: "보호자 전화번호 인증", placeholder: "문자 인증번호를 입력해주세요", stateKey: "code", hasButton: true, buttonType: "verifySms" },
        { id: 5, title: "보호자 비밀번호", placeholder: "보호자 비밀번호를 입력해주세요", stateKey: "password", type: "password" },
        { id: 6, title: "보호자 비밀번호 확인", placeholder: "보호자 비밀번호를 다시 입력해주세요", stateKey: "passwordConfirm", type: "password" },
    ],
}

const ELDER_GROUP = {
    gender: { title: "어르신" },
    fields: [
        { id: 1, title: "어르신 이름", placeholder: "어르신 이름을 입력해주세요", stateKey: "name" },
        { id: 2, title: "어르신 생년월일", placeholder: "YYYY-MM-DD", stateKey: "birth_date" },
        { id: 3, title: "어르신 전화번호", placeholder: "어르신 전화번호를 입력해주세요", stateKey: "phone", hasButton: true, buttonText: "전송", buttonType: "sendSms" },
        { id: 4, title: "어르신 전화번호 인증", placeholder: "문자 인증번호를 입력해주세요", stateKey: "code", hasButton: true, buttonType: "verifySms" },
        { id: 5, title: "어르신 비밀번호", placeholder: "어르신 비밀번호를 입력해주세요", stateKey: "password", type: "password" },
        { id: 6, title: "어르신 비밀번호 확인", placeholder: "어르신 비밀번호를 다시 입력해주세요", stateKey: "passwordConfirm", type: "password" },
        { id: 7, title: "초대코드 인증", placeholder: "초대 코드를 인증해주세요", stateKey: "inviteCode", hasButton: true, buttonType: "verifyInvite" },
    ],
}

export default function Account({ type = "guardian" }) {
    const group = type === "guardian" ? GUARDIAN_GROUP : ELDER_GROUP
    const navigate = useNavigate()

    const [form, setForm] = useState({
        gender: '남성',
        name: '',
        birth_date: '',
        phone: '',
        code: '',
        password: '',
        passwordConfirm: '',
        inviteCode: '',
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

    const isValidDate = (str) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false
        const d = new Date(str)
        return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === str
    }

    const validate = () => {
        const newErrors = {}
        if (!form.name.trim()) newErrors.name = '이름을 입력해주세요.'
        if (form.birth_date && !isValidDate(form.birth_date)) newErrors.birth_date = '생년월일 형식이 올바르지 않습니다. (YYYY-MM-DD)'
        if (!PHONE_REGEX.test(form.phone)) newErrors.phone = '올바른 전화번호를 입력해주세요.'
        if (form.password.length < 8) newErrors.password = '비밀번호는 8자 이상이어야 합니다.'
        if (form.password !== form.passwordConfirm) newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.'
        return newErrors
    }

    const getApiMessage = (err, fallback) => {
        return err?.response?.data?.message || fallback
    }

    const handleSendSms = async () => {
        if (!PHONE_REGEX.test(form.phone)) {
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
        if (!PHONE_REGEX.test(form.phone)) {
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

    const handleVerifyInviteCode = async () => {
        if (!form.inviteCode.trim()) {
            setErrors((prev) => ({ ...prev, inviteCode: '초대코드를 입력해주세요.' }))
            return
        }

        try {
            await verifyInviteCode({ invite_code: form.inviteCode.trim() })
            setNotices((prev) => ({ ...prev, inviteCode: '초대코드 인증이 완료되었습니다.' }))
        } catch (err) {
            setErrors((prev) => ({ ...prev, inviteCode: getApiMessage(err, '초대코드 인증에 실패했습니다.') }))
        }
    }

    const getButtonHandler = (buttonType) => {
        if (buttonType === 'sendSms') return handleSendSms
        if (buttonType === 'verifySms') return handleVerifySms
        if (buttonType === 'verifyInvite') return handleVerifyInviteCode
    }

    const handleSubmit = async () => {
        const newErrors = validate()
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }
        setSubmitError('')

        const data = {
            name: form.name.trim(),
            birth_date: form.birth_date || undefined,
            phone: form.phone,
            password: form.password,
            gender: GENDER_MAP[form.gender],
        }
        try {
            if (type === 'guardian') {
                const res = await guardianSignup(data)

                if (res.data?.isSuccess && res.data?.result?.invite_code) {
                    localStorage.setItem("my_invite_code", res.data.result.invite_code);
                    console.log('초대코드 로컬스토리지 저장 성공:', res.data.result.invite_code);
                }

                console.log('초대코드:', res.data?.result?.invite_code)
            } else {
                await elderSignup({ ...data, invite_code: form.inviteCode.trim() })
            }
            navigate('/login')
        } catch (err) {
            setSubmitError(getApiMessage(err, '회원가입에 실패했습니다. 입력 정보를 다시 확인해주세요.'))
        }
    }

    return (
        <div>
            <div className="mt-11.5">
                <button onClick={() => navigate(-1)}>
                    <img src={back} alt="" className="mb-4" />
                </button>
                <h1 className="font-semibold text-[22px]">안녕하세요 {group.gender.title}님
                    <br />회원가입을 위한 정보를 입력해주세요!
                </h1>
            </div>
            <div className="mt-12 flex flex-col gap-8">
                <GenderToggle
                    title={group.gender.title}
                    onChange={(gender) => setForm((prev) => ({ ...prev, gender }))}
                />
                {group.fields.map((field) => (
                    <Input
                        key={field.id}
                        title={field.title}
                        placeholder={field.placeholder}
                        type={field.type}
                        value={form[field.stateKey]}
                        onChange={handleChange(field.stateKey)}
                        buttonText={field.buttonText}
                        error={errors[field.stateKey]}
                        notice={notices[field.stateKey]}
                        {...(field.hasButton && { onClick: getButtonHandler(field.buttonType) })}
                    />
                ))}
            </div>
            <div className="mt-[38px] pb-4">
                {submitError && <p className="mb-3 text-sm text-red-500">{submitError}</p>}
                <Button title={"회원가입"} main onClick={handleSubmit} />
            </div>
        </div>
    )
}
