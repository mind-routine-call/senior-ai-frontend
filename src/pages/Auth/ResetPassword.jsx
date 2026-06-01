import { useNavigate } from 'react-router-dom'
import back from '../../assets/img/back.svg'
import Input from '../../components/Input'
import Button from '../../components/Button'

export default function ResetPassword() {
  const navigate = useNavigate()
  const goBack = () => {
    navigate(-1)
  }

  const goNext = () => {
    navigate('/reset-password')
  }
  return (
    <div>
        <button className='mt-[46px]' onClick={goBack}>
          <img src={back} alt="" />
        </button>
        <h1 className='mt-6 font-semibold text-[22px]'>비밀번호 재설정</h1>
        <div className='mt-14 flex flex-col gap-8'>
          <Input title={"전화번호 입력"} placeholder={"전화번호를 입력해주세요"}/>
          <Input title={"전화번호 인증"} placeholder={"문자 인증번호를 입력해주세요"}/>
          <Input title={"새 비밀번호 입력"} placeholder={"새 비밀번호를 입력해주세요"}/>
          <Input title={"새 비밀번호 확인"} placeholder={"새 비밀번호를 다시 입력해주세요"}/>
        </div>
        <div className='mt-[75px]'>
          <Button title={"비밀번호 재설정"} onClick={goNext} main/>
        </div>
      </div>
  )
}
