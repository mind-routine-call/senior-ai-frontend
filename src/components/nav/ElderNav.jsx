import { useLocation, useNavigate } from "react-router-dom";
import { Home, PhoneCall } from "lucide-react";

const TABS = [
  { label: "홈", icon: Home, path: "/elder-home" },
  { label: "대화하기", icon: PhoneCall, path: "/elder-chat" },
];

export default function ElderNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav
      className="flex shrink-0 items-center justify-around px-4 py-3 bg-white border-t border-[#ebebeb]"
    >
      {TABS.map(({ label, icon: Icon, path }) => {
        const isActive = pathname === path;
        return (
          <button
            key={path}
            type="button"
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-1 rounded-xl px-8 py-1 transition-opacity active:opacity-70"
            style={{ color: isActive ? "#FF6E61" : "#A2A2A2" }}
          >
            <Icon size={26} strokeWidth={isActive ? 2.5 : 1.8} />
            <span className="text-[13px] font-extrabold">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
