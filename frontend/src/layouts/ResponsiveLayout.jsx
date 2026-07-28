import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import MobileLayout from "./MobileLayout";

export default function ResponsiveLayout() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const resize = () => setMobile(window.innerWidth < 768);

    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, []);

  return mobile ? <MobileLayout /> : <DashboardLayout />;
}