export default function Input({ title, placeholder, onClick }) {
  return (
    <div className="flex flex-col gap-2">
        <p className="text-[18px]">{title}</p>
        <div className="relative">
            <input
            type="text"
            className="w-full bg-[#f6f6f6] h-15 rounded-lg px-4 hover:border border-blue-400 placeholder:text-[#A2A2A2]"
            placeholder={placeholder}/>
            {onClick && (
                <button onClick={onClick} className="absolute right-3 top-1/2 -translate-y-1/2 w-17.75 h-8.75 bg-black rounded-lg">
                    <p className="text-white">확인</p>
                </button>
            )}
        </div>
    </div>
  )
}
