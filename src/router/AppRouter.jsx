import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import CreateCampaign from "../pages/campaign/CreateCampaigns";
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

import AddConversion from "../pages/campaign/Addconversion";
import EditConversion from "../pages/campaign/Editconversion";
import Payments from "../pages/payments/Payments";
import EditPayment from "../pages/payments/EditPayment";
import Notification from "../pages/notifications/Notifications";
import Setting from "../pages/settings/Settings";
import PasswordSetting from "../pages/settings/Passwordsetting ";
import EditCampaign from "../pages/campaign/Editcampaign";
import VerifyEmail from "../pages/auth/VerifyEmail";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyResetCode from "../pages/auth/VerifyResetCode";
import ResetPassword from "../pages/auth/ResetPassword";
import Auth from "../pages/auth/Auth";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";
import InfluencerEarnings from "../pages/payments/InfluencerEarnings";
import BusinessWallet from "../pages/payments/Businesswallet";
import Recharges from "../pages/payments/Recharges";
import RechargeDetails from "../pages/payments/RechargeDetails";
import Profile from "../pages/Profile";
import ChatList from "../pages/campaign/ChatList";
import RoleProtectedRoute from "./RoleProtectedRoute";
import RoleGuard from "./RoleGuard";
import UsersAdmin from "../pages/users/Usersadmin";

export default function AppRouter() {
  const ROLES = {
    SUPER_ADMIN: "super_admin",
    ADMIN: "admin",
    AGENT: "agent",
    BUSINESS: "business",
    INFLUENCER: "influencer",
  };
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const Protect = (roles, element) => (
    <RoleProtectedRoute allowedRoles={roles}>
      {element}
    </RoleProtectedRoute>
  );
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing */}
        <Route path="/" element={<TheHubLanding />} />

        {/* Authentication */}
        <Route path="auth" element={<Auth />}>
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="verify-reset-code" element={<VerifyResetCode />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Protected Layout */}
        <Route
          path="/"
          element={
            <RoleProtectedRoute>
              <ResponsiveLayout />
            </RoleProtectedRoute>
          }
        >

          {/* Dashboard */}
          <Route
            path="dashboard"
            element={Protect(
              [
                ROLES.SUPER_ADMIN,
                ROLES.ADMIN,
                ROLES.AGENT,
                ROLES.BUSINESS,
                ROLES.INFLUENCER,
              ],
              <Home />
            )}
          />
  <Route path="users" element={<UsersAdmin />} />

          {/* Campaigns */}
          <Route
            path="campaigns"
            element={Protect(
              [
                ROLES.SUPER_ADMIN,
                ROLES.ADMIN,
                ROLES.AGENT,
                ROLES.BUSINESS,
                ROLES.INFLUENCER
              ],
              <CampaignLayout />
            )}
          >
            <Route index element={
              <>
              <RoleGuard allowedRoles={[ROLES.INFLUENCER]}> <Campaignclaims  /></RoleGuard>
              <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN,ROLES.ADMIN,ROLES.BUSINESS,ROLES.AGENT]}> <Campaigns /></RoleGuard>  
              </>
             } />

            <Route
              path="create"
              element={Protect(
                [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BUSINESS],
                <EditCampaign />
              )}
            />

  

            <Route
              path=":id/edit"
              element={Protect(
                [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BUSINESS, ROLES.INFLUENCER, ROLES.AGENT],
                <EditCampaign />
              )}
            />

            <Route
              path=":id"
              element={<>
              <RoleGuard allowedRoles={[ROLES.INFLUENCER]}> <ClaimDetail /></RoleGuard>
              <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN,ROLES.ADMIN,ROLES.BUSINESS,ROLES.AGENT]}> <CampaignDetail /></RoleGuard>  
              </>}
            >
              <Route
                index
                element={<>
              <RoleGuard allowedRoles={[ROLES.INFLUENCER]}> <MobileOverview /></RoleGuard>
              <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN,ROLES.ADMIN,ROLES.BUSINESS,ROLES.AGENT]}> <Overview /></RoleGuard>  
              </>}
              />

              <Route path="contents" element={<Contents />} />
              <Route path="chat" element={<Chat />} />
              <Route path="performance" element={<Performance />} />
              <Route path="conversions" element={Protect(
                [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BUSINESS, ROLES.AGENT], <Conversions />)} />
              <Route path="earnings" element={<Earnings />} />
            
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Conversion */}
          <Route
            path="campaigns/:id/conversions/add"
            element={Protect(
              [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.AGENT],
              <AddConversion />
            )}
          />

          <Route
            path="campaigns/:id/conversions/edit/:id2"
            element={Protect(
              [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.AGENT],
              <EditConversion />
            )}
          />

          {/* Influencers */}
          <Route
            path="influencers"
            element={Protect(
              [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.AGENT],
              <Influencers />
            )}
          />

          <Route
            path="influencers/create"
            element={Protect(
              [ROLES.SUPER_ADMIN, ROLES.ADMIN],
              <CreateInfluencer />
            )}
          />

          <Route
            path="influencers/edit/:id"
            element={Protect(
              [ROLES.SUPER_ADMIN, ROLES.ADMIN],
              <EditInfluencer />
            )}
          />

          <Route
            path="influencers/view/:id"
            element={Protect(
              [
                ROLES.SUPER_ADMIN,
                ROLES.ADMIN,

              ],
              <InfluencerDetail />
            )}
          />

          {/* Communities */}
          <Route
            path="communities"
            element={Protect(
              [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.AGENT],
              <Communities />
            )}
          />

          <Route
            path="communities/create"
            element={Protect(
              [ROLES.SUPER_ADMIN, ROLES.ADMIN],
              <CreateCommunity />
            )}
          />

          <Route
            path="communities/edit/:id"
            element={Protect(
              [ROLES.SUPER_ADMIN, ROLES.ADMIN],
              <EditCommunity />
            )}
          />

          <Route
            path="communities/view/:id"
            element={Protect(
              [
                ROLES.SUPER_ADMIN,
                ROLES.ADMIN,
                ROLES.AGENT,
              ],
              <CommunityDetail />
            )}
          />

          {/* Businesses */}
          <Route
            path="businesses"
            element={Protect(
              [ROLES.SUPER_ADMIN, ROLES.ADMIN],
              <Businesses />
            )}
          />

          <Route
            path="businesses/create"
            element={Protect(
              [ROLES.SUPER_ADMIN, ROLES.ADMIN],
              <CreateBusiness />
            )}
          />

          <Route
            path="businesses/edit/:id"
            element={Protect(
              [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.BUSINESS],
              <EditBusiness />
            )}
          />

          <Route
            path="businesses/view/:id"
            element={Protect(
              [ROLES.SUPER_ADMIN, ROLES.ADMIN],
              <BusinessDetail />
            )}
          />

          {/* Payments */}
          <Route
            path="payments"
            element={Protect(
              [ROLES.SUPER_ADMIN, ROLES.ADMIN],
              <Payments />
            )}
          />

          <Route
            path="payments/view/:id"
            element={Protect(
              [ROLES.SUPER_ADMIN, ROLES.ADMIN],
              <EditPayment />
            )}
          />

          {/* Wallet */}
          <Route
            path="wallet"
            element={Protect(
              [ROLES.BUSINESS],
              <BusinessWallet />
            )}
          />

          {/* Earnings */}
          <Route
            path="earnings"
            element={Protect(
              [ROLES.INFLUENCER],
              <InfluencerEarnings />
            )}
          />

          {/* Recharges */}
          <Route
            path="recharges"
            element={Protect(
              [ROLES.SUPER_ADMIN, ROLES.ADMIN],
              <Recharges />
            )}
          />

          <Route
            path="recharges/view/:id"
            element={Protect(
              [ROLES.SUPER_ADMIN, ROLES.ADMIN],
              <RechargeDetails />
            )}
          />

          {/* Chat */}
          <Route
            path="chats"
            element={Protect(
              [
                ROLES.SUPER_ADMIN,
                ROLES.ADMIN,
                ROLES.AGENT,
                ROLES.BUSINESS,
                ROLES.INFLUENCER,
              ],
              <ChatList />
            )}
          />

          {/* Notifications */}
          <Route
            path="notifications"
            element={Protect(
              [
                ROLES.SUPER_ADMIN,
                ROLES.ADMIN,
                ROLES.AGENT,
                ROLES.BUSINESS,
                ROLES.INFLUENCER,
              ],
              <Notification />
            )}
          />

          {/* Profile */}
          <Route
            path="profile"
            element={Protect(
              [
                ROLES.SUPER_ADMIN,
                ROLES.ADMIN,
                ROLES.AGENT,
                ROLES.BUSINESS,
                ROLES.INFLUENCER,
              ],
              <Profile />
            )}
          />

          {/* Settings */}
          <Route
            path="settings"
            element={Protect(
              [
                ROLES.SUPER_ADMIN,
                ROLES.ADMIN,
                ROLES.AGENT,
                ROLES.BUSINESS,
                ROLES.INFLUENCER,
              ],
              <Setting />
            )}
          />

          <Route
            path="settings/password"
            element={Protect(
              [
                ROLES.SUPER_ADMIN,
                ROLES.ADMIN,
                ROLES.AGENT,
                ROLES.BUSINESS,
                ROLES.INFLUENCER,
              ],
              <PasswordSetting />
            )}
          />

          <Route path="*" element={<NotFound />} />

        </Route>

        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="login" element={<Login />} />
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}