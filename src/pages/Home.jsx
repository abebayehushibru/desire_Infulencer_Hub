

import { useState } from "react";
import Button from "../components/common/Button";
import AdminHome from "./home/Adminhome";
import InfluencerHome from "./home/Influencerhome";
import BusinessHome from "./home/Businesshome";
import { useAuth } from "../contexts/AuthContext";
import AgentHome from "./home/Influencerhome";


const homeByRole = {
    super_admin: AdminHome,
  admin: AdminHome,
  influencer: InfluencerHome,
  business: BusinessHome,
  agent: AgentHome
};

export default function Home() {
  const { user } = useAuth();
  const role = user?.role || "influencer";


  const HomeComponent = homeByRole[role] || InfluencerHome;
  return (
    <div className="flex flex-col gap-4">
     <HomeComponent user={user}/>

    </div>

  );
}