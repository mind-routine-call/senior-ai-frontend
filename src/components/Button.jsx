export default function Button({ title, main = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full h-13 rounded-2xl 
      ${main ? "bg-black text-white" : "bg-white text-black"}`}>
      <p>{title}</p>
    </button>
  )
}
