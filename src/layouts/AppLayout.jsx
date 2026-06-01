import { Outlet } from "react-router-dom"

export default function AppLayout() {
  return (
    <div className="w-full px-4 h-full">
      <Outlet />
    </div>
  )
}
