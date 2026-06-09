export default function Button({ title, main = false, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={main ? { background: "linear-gradient(135deg, #FF6E61, #FCA963)" } : undefined}
      className={`w-full h-13 rounded-2xl font-semibold disabled:opacity-50
      ${main ? "text-white" : "bg-white text-black"}`}>
      <p>{title}</p>
    </button>
  )
}
