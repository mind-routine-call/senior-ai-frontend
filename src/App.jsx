import { BrowserRouter, Routes, Route } from "react-router-dom"
import AppLayout from "./layouts/AppLayout"
import Index from "./pages/Auth/index"
import Login from "./pages/Auth/Login"
import Account from "./pages/Auth/Account"
import ResetPassword from "./pages/Auth/ResetPassword"
import Dashboard from "./pages/Dashboard/Index"
import ScheduleManager from "./pages/Schedule/ScheduleManager";
import ElderHome from "./pages/Chat/ElderHome"
import ElderOnboarding from "./pages/Chat/ElderOnboarding"
import ElderChat from "./pages/Chat/ElderChat"

export default function App() {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-[393px] h-[852px] relative overflow-hidden bg-white rounded-[40px] shadow-[0_4px_32px_rgba(0,0,0,0.18)] shrink-0">
        <div className="w-full h-full overflow-y-auto">
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/account" element={<Account type="guardian"/>} />
                <Route path="/account/elder" element={<Account type="elder"/>} />
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/schedule" element={<ScheduleManager />} />
                <Route path="/elder-home" element={<ElderHome />} />
                <Route path="/elder-onboarding" element={<ElderOnboarding />} />
                <Route path="/elder-chat" element={<ElderChat />} />
                <Route path="/chat" element={<ElderChat />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </div>
  )
}
