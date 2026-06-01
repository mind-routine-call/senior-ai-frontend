import { Navigate, useNavigate } from 'react-router-dom'
import logo from '../../assets/img/mind_routine.svg'
import Button from "../../components/Button"

const Index = () => {
  const navigate = useNavigate()
  const handleLoginClick = () => {
    navigate('/login')
  }
  const handleAccountClick = () => {
    navigate('/account')
  }

  return (
    <div className='mt-74.25'>
      <div className='flex justify-center'>
        <img src={logo} alt="" className='w-45 h-24' />
      </div>
      <div className='mt-79.25 flex flex-col gap-4'>
        <Button title={"로그인"} main onClick={handleLoginClick}/>
        <Button title={"회원가입"} onClick={handleAccountClick} />
      </div>
    </div>
  )
}

export default Index