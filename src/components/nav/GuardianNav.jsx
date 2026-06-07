import { useLocation, useNavigate } from "react-router-dom";
import { Bell, BookHeart, Calendar, LayoutDashboard } from "lucide-react";

const TABS = [
  { label: "대시보드", icon: LayoutDashboard, base: "/dashboard" },
  { label: "일정", icon: Calendar, base: "/schedule" },
  { label: "알림", icon: Bell, base: "/notification" },
  { label: "추억", icon: BookHeart, base: "/memory" },
];

export default function GuardianNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const elderId =
    localStorage.getItem("selectedElderId") ||
    localStorage.getItem("elder_id");

  const handleNav = (base) => {
    navigate(elderId ? `${base}/${elderId}` : base);
  };

  return (
    <nav className="flex shrink-0 items-center justify-around bg-white px-2 py-2 border-t border-[#ebebeb]">
      {TABS.map(({ label, icon: Icon, base }) => {
        const isActive = pathname.startsWith(base);
        return (
          <button
            key={base}
            type="button"
            onClick={() => handleNav(base)}
            className="flex flex-col items-center gap-1 rounded-xl px-4 py-1 transition-opacity active:opacity-70"
            style={{ color: isActive ? "#FF6E61" : "#A2A2A2" }}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            <span className="text-[11px] font-bold">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
