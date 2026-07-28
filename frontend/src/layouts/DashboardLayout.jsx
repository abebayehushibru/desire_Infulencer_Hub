import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
export default function DashboardLayout() {
  return (
    <div className="flex flex-row bg-primary/10 poppins min-h-screen text-primary">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className=" flex-1   relative ">
          <div className="max-h-full flex flex-col w-full absolute  p-4  overflow-auto">
            <Outlet />
          </div>

        </main>
      </div>
    </div>
  );
}