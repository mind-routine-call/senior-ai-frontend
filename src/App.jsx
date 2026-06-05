import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Index from "./pages/Auth/index";
import Login from "./pages/Auth/Login";
import Account from "./pages/Auth/Account";
import ResetPassword from "./pages/Auth/ResetPassword";
import Dashboard from "./pages/Dashboard/Index";
import ScheduleManager from "./pages/Schedule/ScheduleManager";
import ScheduleList from "./pages/Schedule/ScheduleList";
import NotificationCenter from "./pages/Notification/NotificationCenter";

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
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/:elderId" element={<Dashboard />} />
                <Route path="/schedule" element={<ScheduleManager />} />
                <Route path="/schedule/:elderId" element={<ScheduleManager />} />
                <Route path="/schedule/list/:elderId" element={<ScheduleList />} />
                <Route path="/notification" element={<NotificationCenter />} />
                <Route path="/notification/:elderId" element={<NotificationCenter />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </div>
  );
}
