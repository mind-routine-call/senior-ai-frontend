import { BrowserRouter, Routes, Route } from "react-router-dom"
import Index from "./pages/Auth/Index"
import ScheduleManager from "./pages/Schedule/ScheduleManager"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/schedule" element={<ScheduleManager />} />
      </Routes>
    </BrowserRouter>
  )
}
