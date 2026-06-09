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
    <main className="auth-page auth-page--welcome">
      <div className="welcome-logo">
        <img src={logo} alt="마인드루틴" />
      </div>
      <div className="welcome-actions">
        <Button title={"보호자로 회원가입하기"} main onClick={handleGuardianSignupClick} />
        <Button title={"어르신으로 회원가입하기"} main onClick={handleElderSignupClick} />
        <Button title={"로그인"} onClick={handleLoginClick}/>
      </div>
    </main>
  )
}

export default Index
