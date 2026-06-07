import { useState } from "react"

const GENDERS = ["남성", "여성"]

export default function GenderToggle({ title, onChange }) {
    const [selectedGender, setSelectedGender] = useState(GENDERS[0])
    const handleClick = (gender) => {
        setSelectedGender(gender)
        onChange(gender)
    }

    return (
        <div className="flex justify-between items-center">
            <p className="text-[18px]">{title} 성별</p>
            <div className="flex w-38.75 h-10 bg-[#F6F6F6] rounded-lg p-1 gap-1">
                {GENDERS.map((gender) => (
                    <button
                        key={gender}
                        type="button"
                        onClick={() => handleClick(gender)}
                        className={`flex-1 rounded-lg text-sm font-medium transition-colors
                        ${selectedGender === gender ? "bg-white font-semibold" : "text-[#A2A2A2]"}`}
                        style={selectedGender === gender ? { color: "#FF6E61" } : undefined}
                        >
                        {gender}
                    </button>
                ))}
            </div>
        </div>
    )
}
