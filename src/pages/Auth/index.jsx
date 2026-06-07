import { useNavigate } from 'react-router-dom'
import logo from '../../assets/img/mind_routine_logo.svg'
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
    <div className='mt-70'>
      <div className='flex justify-center'>
        <img src={logo} alt="" />
      </div>
      <div className='mt-52 flex flex-col gap-4'>
        <Button title={"보호자로 회원가입하기"} main onClick={handleGuardianSignupClick} />
        <Button title={"어르신으로 회원가입하기"} main onClick={handleElderSignupClick} />
        <Button title={"로그인"} onClick={handleLoginClick}/>
      </div>
    </div>
  )
}

export default Index
