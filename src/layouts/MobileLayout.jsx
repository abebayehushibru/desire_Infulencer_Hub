import { Outlet, useLocation } from "react-router-dom";
import MobileHeader from "../components/MobileHeader";
import MobileBottomNav from "../components/MobileBottomNav";

export default function MobileLayout() {
  const location = useLocation();
    const isChatRoute = /^\/campaigns\/[^/]+\/chat$/.test(location.pathname);
  return (
    <div className="bg-white flex flex-col min-h-screen">

    

      <main className={` relative flex-1 ${isChatRoute ? '' : 'pb-24'} flex flex-col h-full  px-4 pt-4`}>
        <Outlet />
      </main>

     {!isChatRoute && <MobileBottomNav />}

    </div>
  );
}