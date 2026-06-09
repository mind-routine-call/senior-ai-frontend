import { useLocation, useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

export default function ElderNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isActive = pathname === "/elder-home";

  return (
    <nav className="shrink-0 border-t border-[#ebebeb] bg-white px-4 py-2">
      <button
        type="button"
        onClick={() => navigate("/elder-home")}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl transition-colors active:bg-[#FFF3EE]"
        style={{ color: isActive ? "#FF6E61" : "#1A1A1A" }}
      >
        <Home size={29} strokeWidth={isActive ? 2.6 : 2.2} />
        <span className="text-[18px] font-extrabold">홈</span>
      </button>
    </nav>
  );
}
