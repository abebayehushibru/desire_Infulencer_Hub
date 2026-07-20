import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";

// ── Layouts ───────────────────────────────────────────────────────────────────
import ResponsiveLayout from "../layouts/ResponsiveLayout";
import CampaignLayout   from "../layouts/CampaignLayout";

// ── Auth pages (pages/auth/) ──────────────────────────────────────────────────
import Login           from "../pages/auth/Login";
import Register        from "../pages/auth/Register";
import VerifyEmail     from "../pages/auth/VerifyEmail";
import ForgotPassword  from "../pages/auth/ForgotPassword";
import VerifyResetCode from "../pages/auth/VerifyResetCode";
import ResetPassword   from "../pages/auth/ResetPassword";

// ── Public landing page ───────────────────────────────────────────────────────
import Landing from "../pages/Landing";

// ── Auth guards ───────────────────────────────────────────────────────────────
import PrivateRoute  from "./PrivateRoute";
import useAuthStore  from "../store/authStore";

// ── Dashboard ─────────────────────────────────────────────────────────────────
import Home from "../pages/Home";

// ── Campaign pages ────────────────────────────────────────────────────────────
import Campaigns      from "../pages/campaign/Campaigns";
import CreateCampaign from "../pages/campaign/CreateCampaign";
import CampaignDetail from "../pages/campaign/CampaignDetail";
import Campaignclaims from "../pages/campaign/Campaignclaims";
import ClaimDetail    from "../pages/campaign/ClaimDetail";
import Overview       from "../pages/campaign/Overview";
import MobileOverview from "../pages/campaign/MobileOverview";
import Contents       from "../pages/campaign/Contents";
import Chat           from "../pages/campaign/Chat";
import Performance    from "../pages/campaign/Performance";
import Conversions    from "../pages/campaign/Conversions";
import Earnings       from "../pages/campaign/Earnings";

// ── Influencer pages ──────────────────────────────────────────────────────────
import Influencers      from "../pages/influencers/Influencers";
import CreateInfluencer from "../pages/influencers/CreateInfluencer";
import EditInfluencer   from "../pages/influencers/Editinfluencer";
import InfluencerDetail from "../pages/influencers/Influencerdetail";

// ── Community pages ───────────────────────────────────────────────────────────
import Communities    from "../pages/community/Communities";
import CreateCommunity from "../pages/community/Createcommunity";
import EditCommunity  from "../pages/community/Editcommunity";
import CommunityDetail from "../pages/community/Communitydetail";

// ── Business pages ────────────────────────────────────────────────────────────
import Businesses    from "../pages/business/Businesses";
import CreateBusiness from "../pages/business/Createbusiness";
import EditBusiness  from "../pages/business/Editbusiness";
import BusinessDetail from "../pages/business/Businessdetail";

// ─────────────────────────────────────────────────────────────────────────────
// PublicOnlyRoute — redirects authenticated users away from auth pages
// ─────────────────────────────────────────────────────────────────────────────
function PublicOnlyRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  return token ? <Navigate to="/dashboard" replace /> : children;
}

// ─────────────────────────────────────────────────────────────────────────────
// AppRouter
// ─────────────────────────────────────────────────────────────────────────────
export default function AppRouter() {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public landing page (always accessible) ─────────────────────── */}
        <Route path="/" element={<Landing />} />

        {/* ── Auth pages (redirect to /dashboard if already logged in) ──────── */}
        <Route path="/login"            element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register"         element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/verify-email"     element={<VerifyEmail />} />
        <Route path="/forgot-password"  element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
        <Route path="/verify-reset-code" element={<VerifyResetCode />} />
        <Route path="/reset-password"   element={<ResetPassword />} />

        {/* ── Protected dashboard (requires valid token) ──────────────────── */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<ResponsiveLayout />}>

            {/* Home */}
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
                <Route index element={isMobile ? <MobileOverview /> : <Overview />} />
                <Route path="overview"    element={isMobile ? <MobileOverview /> : <Overview />} />
                <Route path="contents"    element={<Contents />} />
                <Route path="chat"        element={<Chat />} />
                <Route path="performance" element={<Performance />} />
                <Route path="conversions" element={<Conversions />} />
                <Route path="earnings"    element={<Earnings />} />
                <Route path="*"           element={<h1>404 — Not Found</h1>} />
              </Route>

              <Route path="*" element={<h1>404 — Not Found</h1>} />
            </Route>

            {/* Influencers */}
            <Route path="influencers"           element={<Influencers />} />
            <Route path="influencers/create"    element={<CreateInfluencer />} />
            <Route path="influencers/edit/:id"  element={<EditInfluencer />} />
            <Route path="influencers/view/:id"  element={<InfluencerDetail />} />

            {/* Communities */}
            <Route path="communities"           element={<Communities />} />
            <Route path="communities/create"    element={<CreateCommunity />} />
            <Route path="communities/view/:id"  element={<CommunityDetail />} />
            <Route path="communities/edit/:id"  element={<EditCommunity />} />

            {/* Businesses */}
            <Route path="businesses"            element={<Businesses />} />
            <Route path="businesses/create"     element={<CreateBusiness />} />
            <Route path="businesses/edit/:id"   element={<EditBusiness />} />
            <Route path="businesses/view/:id"   element={<BusinessDetail />} />

            <Route path="*" element={<h1>404 — Not Found</h1>} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<h1>404 — Page Not Found</h1>} />

      </Routes>
    </BrowserRouter>
  );
}
