import { useNavigate } from "react-router-dom"
import Button from "../../components/Button"
import Input from "../../components/Input"
import GenderToggle from "./components/GenderToggle"
import back from '../../assets/img/back.svg'

const GUARDIAN_GROUP = {
    gender: { title: "보호자" },
    fields: [
        { id: 1, title: "보호자 이름", placeholder: "보호자 이름을 입력해주세요" },
        { id: 2, title: "보호자 전화번호", placeholder: "보호자 전화번호를 입력해주세요" },
        { id: 3, title: "보호자 전화번호 인증", placeholder: "문자 인증번호를 입력해주세요" },
        { id: 4, title: "보호자 비밀번호", placeholder: "보호자 비밀번호를 입력해주세요" },
        { id: 5, title: "보호자 비밀번호 확인", placeholder: "보호자 비밀번호를 다시 입력해주세요" },
    ],
}

const ELDER_GROUP = {
    gender: { title: "어르신" },
    fields: [
        { id: 1, title: "어르신 이름", placeholder: "어르신 이름을 입력해주세요" },
        { id: 2, title: "어르신 전화번호", placeholder: "어르신 전화번호를 입력해주세요" },
        { id: 3, title: "어르신 전화번호 인증", placeholder: "문자 인증번호를 입력해주세요" },
        { id: 4, title: "어르신 비밀번호", placeholder: "어르신 비밀번호를 입력해주세요" },
        { id: 5, title: "어르신 비밀번호 확인", placeholder: "어르신 비밀번호를 다시 입력해주세요" },
        { id: 6, title: "초대코드 인증", placeholder: "초대 코드를 인증해주세요", hasButton: true },
    ],
}

export default function Account({ type = "guardian" }) {
const group = type === "guardian" ? GUARDIAN_GROUP : ELDER_GROUP
const navigate = useNavigate()
const goBack = () => {
    navigate(-1)
}

  return (
    <div>
        <div className="mt-11.5">
            <button onClick={goBack}>
                <img src={back} alt="" className="mb-4" />
            </button>
            <h1 className="font-semibold text-[22px]">안녕하세요 {group.gender.title}님
                <br />회원가입을 위한 정보를 입력해주세요!
            </h1>
        </div>
        <div className="mt-12 flex flex-col gap-8">
            <GenderToggle title={group.gender.title}/>
            {group.fields.map((field) => (
                <Input key={field.id} {...field} {...(field.hasButton && { onClick: () => {} })}/>
            ))}
        </div>
        <div className="mt-[38px] pb-4">  
            <Button title={"회원가입"} main/>
        </div>
    </div>
  )
}
