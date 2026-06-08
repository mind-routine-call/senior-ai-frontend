import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import RoleGuard from "./components/RoleGuard";
import Index from "./pages/Auth/index";
import Login from "./pages/Auth/Login";
import Account from "./pages/Auth/Account";
import ResetPassword from "./pages/Auth/ResetPassword";
import Dashboard from "./pages/Dashboard/Index";
import ScheduleManager from "./pages/Schedule/ScheduleManager";
import ScheduleList from "./pages/Schedule/ScheduleList";
import NotificationCenter from "./pages/Notification/NotificationCenter";
import MemoryList from "./pages/Memory/List";
import MemoryWrite from "./pages/Memory/Write";
import GuardianElderRegister from "./pages/ElderRegister/GuardianElderRegister";
import ElderHome from "./pages/Chat/ElderHome";
import ElderOnboarding from "./pages/Chat/ElderOnboarding";
import ElderChat from "./pages/Chat/ElderChat";
import GuardianChatHistory from "./pages/GuardianChat/GuardianChatHistory";
import MyPage from "./pages/MyPage/MyPage";

export default function App() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="relative h-[852px] w-[393px] shrink-0 overflow-hidden rounded-[40px] bg-white shadow-[0_4px_32px_rgba(0,0,0,0.18)]">
        <div className="h-full w-full overflow-y-auto">
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/account" element={<Account type="guardian" />} />
                <Route path="/account/elder" element={<Account type="elder" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route element={<RoleGuard allowedRoles={["guardian"]} />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/:elderId" element={<Dashboard />} />
                  <Route path="/schedule" element={<ScheduleManager />} />
                  <Route path="/schedule/:elderId" element={<ScheduleManager />} />
                  <Route path="/schedule/list/:elderId" element={<ScheduleList />} />
                  <Route path="/notification" element={<NotificationCenter />} />
                  <Route path="/notification/:elderId" element={<NotificationCenter />} />
                  <Route path="/memory" element={<MemoryList />} />
                  <Route path="/memory/:elderId" element={<MemoryList />} />
                  <Route path="/memory/write" element={<MemoryWrite />} />
                  <Route path="/memory/:elderId/write" element={<MemoryWrite />} />
                  <Route path="/guardian/elders/:elderId/chats" element={<GuardianChatHistory />} />
                  <Route path="/guardian/elders/:elderId/chats/:callId" element={<GuardianChatHistory />} />
                  <Route path="/guardian/elders/register" element={<GuardianElderRegister />} />
                </Route>
                <Route element={<RoleGuard allowedRoles={["elder"]} />}>
                  <Route path="/elder-home" element={<ElderHome />} />
                  <Route path="/elder-onboarding" element={<ElderOnboarding />} />
                  <Route path="/elder-chat" element={<ElderChat />} />
                  <Route path="/chat" element={<ElderChat />} />
                </Route>
                <Route element={<RoleGuard allowedRoles={["guardian", "elder"]} />}>
                  <Route path="/mypage" element={<MyPage />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </div>
  );
}
