import { useNavigate } from 'react-router-dom'
import logo from '../../assets/img/mind_routine.svg'
import Button from "../../components/Button"

const Index = () => {
  const navigate = useNavigate()
  const handleLoginClick = () => {
    navigate('/login')
  }
  const handleGuardianSignupClick = () => {
    navigate('/account')
  }
  const handleElderSignupClick = () => {
    navigate('/account/elder')
  }

  return (
    <div className='mt-74.25'>
      <div className='flex justify-center'>
        <img src={logo} alt="" className='w-45 h-24' />
      </div>
      <div className='mt-79.25 flex flex-col gap-4'>
        <Button title={"보호자로 회원가입하기"} main onClick={handleGuardianSignupClick} />
        <Button title={"어르신으로 회원가입하기"} main onClick={handleElderSignupClick} />
        <Button title={"로그인"} onClick={handleLoginClick}/>
      </div>
    </div>
  )
}

export default Index
