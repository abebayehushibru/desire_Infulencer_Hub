import { Outlet, useLocation } from "react-router-dom";
import MobileHeader from "../components/MobileHeader";
import MobileBottomNav from "../components/MobileBottomNav";
import AnimatedBackground from "../components/AnimatedBackground";

export default function MobileLayout() {
  const location = useLocation();
    const isChatRoute = /^\/campaigns\/[^/]+\/chat$/.test(location.pathname);
  return (
    <div className="bg-white poppins-regular flex flex-col min-h-screen">

       

    

      <main className={` relative flex-1 ${isChatRoute ? 'min-h-screen ' : 'pb-24 h-full'} flex flex-col   px-4 pt-4`}>
        <Outlet />
      </main>
       <AnimatedBackground />

     {!isChatRoute && <MobileBottomNav />}

    </div>
  );
}