import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import CreateCampaign from "../pages/campaign/CreateCampaign";
import CampaignDetail from "../pages/campaign/CampaignDetail";
import Contents from "../pages/campaign/Contents";
import Chat from "../pages/campaign/Chat";
import Performance from "../pages/campaign/Performance";
import Conversions from "../pages/campaign/Conversions";
import Earnings from "../pages/campaign/Earnings";
import Campaignclaims from "../pages/campaign/Campaignclaims";
import CampaignLayout from "../layouts/CampaignLayout";
import Campaigns from "../pages/campaign/Campaigns";
import ResponsiveLayout from "../layouts/ResponsiveLayout";
import ClaimDetail from "../pages/campaign/ClaimDetail";
import { useMediaQuery } from 'react-responsive';
import Overview from "../pages/campaign/Overview";
import MobileOverview from "../pages/campaign/MobileOverview";
import Login from "../pages/Login";
import Influencers from "../pages/Influencers/Influencers";
import CreateInfluencer from "../pages/Influencers/CreateInfluencer";
import EditInfluencer from "../pages/Influencers/Editinfluencer";
import InfluencerDetail from "../pages/Influencers/Influencerdetail";
import CommunityDetail from "../pages/community/Communitydetail";
import Communities from "../pages/community/Communities";
import CreateCommunity from "../pages/community/Createcommunity";
import EditCommunity from "../pages/community/Editcommunity";
import CreateBusiness from "../pages/business/Createbusiness";
import EditBusiness from "../pages/business/Editbusiness";
import BusinessDetail from "../pages/business/Businessdetail";
import Businesses from "../pages/business/Businesses";
import TheHubLanding from "../pages/Landing";
import Register from "../pages/Register";
import AddConversion from "../pages/campaign/Addconversion";
import EditConversion from "../pages/campaign/Editconversion";
import Payments from "../pages/payments/Payments";
export default function AppRouter() {

  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TheHubLanding />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ResponsiveLayout />}>

          <Route path="dashboard" element={<Home />} />
          <Route path="campaigns" element={<CampaignLayout />}>
            <Route index element={<Campaigns />} />
            <Route path="create" element={<CreateCampaign />} />
            <Route path="claims" element={<Campaignclaims />} />

            <Route path=":id" element={isMobile ? <ClaimDetail /> : <CampaignDetail />}>
              <Route index element={isMobile ? <MobileOverview /> : <Overview />} />

              <Route path="overview" index element={isMobile ? <MobileOverview /> : <Overview />} />
              <Route path="contents" element={<Contents />} />
              <Route path="chat" element={<Chat />} />
              <Route path="performance" element={<Performance />} />
              <Route path="conversions" element={<Conversions />} />

              <Route path="earnings" element={<Earnings />} />

              <Route path="*" element={<h1>404 - Page Not Found</h1>} />
            </Route>
            <Route path="*" element={<h1>404 - Page Not Found</h1>} />
          </Route>
            <Route path="campaigns/:id/conversions/add" element={<AddConversion />} />
                      <Route path="campaigns/:id/conversions/edit/:id2" element={<EditConversion />} />
          <Route path="influencers" element={<Influencers />} />
          <Route path="influencers/create" element={<CreateInfluencer />} />
          <Route path="influencers/edit/:id" element={<EditInfluencer />} />
          <Route path="influencers/view/:id" element={<InfluencerDetail />} />
          <Route path="communities" element={<Communities />} />
          <Route path="communities/create" element={<CreateCommunity />} />
          <Route path="communities/view/:id" element={<CommunityDetail />} />
          <Route path="communities/edit/:id" element={<EditCommunity />} />
          <Route path="businesses" element={<Businesses />} />
          <Route path="businesses/create" element={<CreateBusiness />} />
          <Route path="businesses/edit/:id" element={<EditBusiness />} />
          <Route path="businesses/view/:id" element={<BusinessDetail />} />
<Route path="payments" element={<Payments />} />

          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Route>
        <Route path="login" element={<Login />} />

        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}