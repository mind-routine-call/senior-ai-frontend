import { Outlet, useLocation } from "react-router-dom";
import GuardianNav from "../components/nav/GuardianNav";
import ElderNav from "../components/nav/ElderNav";
import { getStoredRole } from "../utils/authSession";

const GUARDIAN_PATHS = ["/dashboard", "/schedule", "/notification", "/memory"];
const ELDER_PATHS = ["/elder-home", "/elder-chat", "/mypage"];

function getNavType(pathname) {
  const role = getStoredRole();
  if (role === "guardian" && GUARDIAN_PATHS.some((p) => pathname.startsWith(p))) return "guardian";
  if (role === "elder" && ELDER_PATHS.some((p) => pathname.startsWith(p))) return "elder";
  return null;
}

export default function AppLayout() {
  const { pathname } = useLocation();
  const navType = getNavType(pathname);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="app-scroll-region min-h-0 flex-1 overflow-y-auto px-4">
        <Outlet />
      </div>
      {navType === "guardian" && <GuardianNav />}
      {navType === "elder" && <ElderNav />}
    </div>
  );
}
