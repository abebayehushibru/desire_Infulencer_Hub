import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";

// Layouts
import ResponsiveLayout from "../layouts/ResponsiveLayout";
import CampaignLayout from "../layouts/CampaignLayout";

// Public pages
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";

// Auth guards
import PrivateRoute from "./PrivateRoute";
import useAuthStore from "../store/authStore";

// Dashboard
import Home from "../pages/Home";

// Campaign pages
import CreateCampaign from "../pages/campaign/CreateCampaign";
import CampaignDetail from "../pages/campaign/CampaignDetail";
import Contents from "../pages/campaign/Contents";
import Chat from "../pages/campaign/Chat";
import Performance from "../pages/campaign/Performance";
import Conversions from "../pages/campaign/Conversions";
import Earnings from "../pages/campaign/Earnings";
import Campaignclaims from "../pages/campaign/Campaignclaims";
import Campaigns from "../pages/campaign/Campaigns";
import ClaimDetail from "../pages/campaign/ClaimDetail";
import Overview from "../pages/campaign/Overview";
import MobileOverview from "../pages/campaign/MobileOverview";

// Influencer pages
import Influencers from "../pages/influencers/Influencers";
import CreateInfluencer from "../pages/influencers/CreateInfluencer";
import EditInfluencer from "../pages/influencers/Editinfluencer";
import InfluencerDetail from "../pages/influencers/Influencerdetail";

// Community pages
import CommunityDetail from "../pages/community/Communitydetail";
import Communities from "../pages/community/Communities";
import CreateCommunity from "../pages/community/Createcommunity";
import EditCommunity from "../pages/community/Editcommunity";

// Business pages
import CreateBusiness from "../pages/business/Createbusiness";
import EditBusiness from "../pages/business/Editbusiness";
import BusinessDetail from "../pages/business/Businessdetail";
import Businesses from "../pages/business/Businesses";

/**
 * PublicOnlyRoute — wraps /login and /register.
 * Redirects already-authenticated users to /dashboard.
 */
function PublicOnlyRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  return token ? <Navigate to="/dashboard" replace /> : children;
}

export default function AppRouter() {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <BrowserRouter>
      <Routes>

        {/* ── Fully public routes ───────────────────────────────────────── */}

        {/* Landing page — always public, never redirects to login */}
        <Route path="/" element={<Landing />} />

        {/* Login — redirects to /dashboard if already authenticated */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        {/* Register — redirects to /dashboard if already authenticated */}
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        {/* ── Protected routes (require valid token) ────────────────────── */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<ResponsiveLayout />}>

            {/* Default dashboard home */}
            <Route index element={<Home />} />

            {/* Campaigns */}
            <Route path="campaigns" element={<CampaignLayout />}>
              <Route index element={<Campaigns />} />
              <Route path="create" element={<CreateCampaign />} />
              <Route path="claims" element={<Campaignclaims />} />

              <Route
                path=":id"
                element={isMobile ? <ClaimDetail /> : <CampaignDetail />}
              >
                <Route
                  index
                  element={isMobile ? <MobileOverview /> : <Overview />}
                />
                <Route
                  path="overview"
                  element={isMobile ? <MobileOverview /> : <Overview />}
                />
                <Route path="contents" element={<Contents />} />
                <Route path="chat" element={<Chat />} />
                <Route path="performance" element={<Performance />} />
                <Route path="conversions" element={<Conversions />} />
                <Route path="earnings" element={<Earnings />} />
                <Route path="*" element={<h1>404 — Page Not Found</h1>} />
              </Route>

              <Route path="*" element={<h1>404 — Page Not Found</h1>} />
            </Route>

            {/* Influencers */}
            <Route path="influencers" element={<Influencers />} />
            <Route path="influencers/create" element={<CreateInfluencer />} />
            <Route path="influencers/edit/:id" element={<EditInfluencer />} />
            <Route path="influencers/view/:id" element={<InfluencerDetail />} />

            {/* Communities */}
            <Route path="communities" element={<Communities />} />
            <Route path="communities/create" element={<CreateCommunity />} />
            <Route path="communities/view/:id" element={<CommunityDetail />} />
            <Route path="communities/edit/:id" element={<EditCommunity />} />

            {/* Businesses */}
            <Route path="businesses" element={<Businesses />} />
            <Route path="businesses/create" element={<CreateBusiness />} />
            <Route path="businesses/edit/:id" element={<EditBusiness />} />
            <Route path="businesses/view/:id" element={<BusinessDetail />} />

            <Route path="*" element={<h1>404 — Page Not Found</h1>} />
          </Route>
        </Route>

        {/* Legacy /campaigns shortcut → /dashboard/campaigns */}
        <Route
          path="/campaigns/*"
          element={<Navigate to="/dashboard/campaigns" replace />}
        />

        {/* Catch-all */}
        <Route path="*" element={<h1>404 — Page Not Found</h1>} />

      </Routes>
    </BrowserRouter>
  );
}
