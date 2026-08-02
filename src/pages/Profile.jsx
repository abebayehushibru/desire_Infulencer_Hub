import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Lock,
    LogOut,
    ChevronRight,
    Mail,
    Loader2,
    AlertCircle,
    Megaphone,
    Wallet,
    BadgeCheck,
    Clock,
    Users,
    Music2,
    Camera,
    Video,
    Send,
    Globe,
    Award,
    Medal,
    Gem,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Avatar from "../components/common/Avatar";

// Links only shown when the signed-in user is an influencer.
// Add/remove entries here as those features ship — everything else
// on the page (avatar, name, email, change password, sign out) is
// shared by every account type.
const INFLUENCER_LINKS = [
    { icon: Megaphone, label: "My Campaigns", to: "/campaigns" },
    { icon: Wallet, label: "My Earnings", to: "/earnings" },
];

const PLATFORMS = { tiktok: Music2, instagram: Camera, facebook: Users, youtube: Video, telegram: Send, other: Globe };

const LEVEL_CONFIG = {
    diamond: {
        label: "Diamond",
        icon: Gem,
        styles: "text-sky-600 bg-sky-50 border-sky-200",
    },
    gold: {
        label: "Gold",
        icon: Award,
        styles: "text-[#8a5a00] bg-[var(--color-tertiary)]/15 border-[var(--color-tertiary)]",
    },
    silver: {
        label: "Silver",
        icon: Medal,
        styles: "text-slate-600 bg-slate-100 border-slate-300",
    },
};

function MenuItem({ icon: Icon, label, onClick, tone = "default" }) {
    const toneStyles =
        tone === "danger"
            ? "text-rose-600 hover:bg-rose-50"
            : "text-gray-700 hover:bg-gray-50";

    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors ${toneStyles}`}
        >
            <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone === "danger" ? "bg-rose-100 text-rose-600" : "bg-gray-100 text-gray-500"
                    }`}
            >
                <Icon size={15} />
            </span>
            <span className="flex-1">{label}</span>
            {tone !== "danger" && <ChevronRight size={15} className="text-gray-300" />}
        </button>
    );
}

function StatCard({ icon: Icon, value, label, subLabel = "" }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon size={16} />
            </span>
            <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-800">{value}</p>
                <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                {subLabel && <p className="truncate text-xs text-gray-500">{subLabel}</p>}
            </div>
        </div>
    );
}

function LevelStatCard({ level }) {
    const levelKey = String(level).toLowerCase();
    const config = LEVEL_CONFIG[levelKey];

    if (!config) return null;

    return <StatCard icon={config.icon} value={config.label} label="Level" />;
}

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [signingOut, setSigningOut] = useState(false);
    const [signOutError, setSignOutError] = useState(false);

    // AuthContext hasn't resolved the current user yet.
    if (!user) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={28} className="animate-spin text-primary" />
                    <p className="text-sm font-medium text-gray-500">Loading profile...</p>
                </div>
            </div>
        );
    }

    const isInfluencer = user?.role === "influencer";
    const isVerified = !!user?.influencer_profile?.is_verified;
    const communityCount = user?.community_memberships?.length || 0;
    const followerCount = user?.influencer_profile?.followers_count || 0;
    const level = user?.influencer_profile?.level;
    const mainPlatform = user?.influencer_profile?.main_platform;
    const PlatformIcon = mainPlatform ? PLATFORMS[mainPlatform] || Globe : null;

    const handleSignOut = async () => {
        setSigningOut(true);
        setSignOutError(false);

        try {
            await logout();
            localStorage.removeItem("token");
            navigate("/auth/login");
        } catch {
            setSignOutError(true);
            setSigningOut(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-full space-y-4 sm:max-w-5xl sm:space-y-6 sm:py-0">

            {/* Identity card */}
            <div className="relative -mx-5 -mt-5 overflow-hidden rounded-none border border-gray-200 bg-white shadow-sm sm:mx-0 sm:mt-4 sm:rounded-lg">
                <div
                    className="
                        flex flex-col items-center bg-gradient-to-b from-primary to-secondary/90 px-4 pb-6 pt-6 text-white
                        sm:flex-row sm:items-center sm:gap-6 sm:px-8 sm:py-7
                    "
                >
                    <div className="shrink-0 rounded-full ring ring-white/30">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-20 w-20 rounded-full object-cover sm:h-24 sm:w-24"
                            />
                        ) : (
                            <Avatar name={user.name} size={60} className="h-20 w-20 text-xl sm:h-24 sm:w-24 sm:text-2xl" />
                        )}
                    </div>

                    <div className="mt-3 flex min-w-0 flex-1 flex-col items-center sm:mt-0 sm:items-start">
                        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
                            <p className="truncate text-base font-bold sm:text-xl">{user.name || "Unnamed User"}</p>
                            {isVerified && (
                                <span title="Verified influencer">
                                    <BadgeCheck size={16} className="shrink-0 text-white sm:size-[18px]" />
                                </span>
                            )}
                        </div>
                        <p className="mt-0.5 flex items-center justify-center gap-1.5 truncate text-xs font-medium text-white/80 sm:justify-start sm:text-sm">
                            <Mail size={12} />
                            {user.email}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
                            <span className="inline-block rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                                {user.role}
                            </span>

                            {isInfluencer && (
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${isVerified
                                        ? "bg-sky-100 text-sky-700"
                                        : "bg-yellow-100 text-yellow-700"
                                        }`}
                                >
                                    {isVerified ? <BadgeCheck size={11} /> : <Clock size={11} />}
                                    {isVerified ? "Verified" : "Pending Verification"}
                                </span>
                            )}
                        </div>
                    </div>

                    {isInfluencer && (
                        <div
                            className="
                                mt-5 flex w-full items-center justify-center divide-x divide-white/20 border-t border-white/15 pt-4
                                sm:mt-0 sm:w-auto sm:shrink-0 sm:justify-end sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0
                            "
                        >
                            <div className="flex flex-1 flex-col items-center sm:flex-none sm:px-4">
                                <p className="text-lg font-bold sm:text-2xl">{followerCount?.toLocaleString() || 0}</p>
                                <p className="text-xs text-white/80">Followers</p>
                            </div>
                            <div className="flex flex-1 flex-col items-center sm:flex-none sm:px-4">
                                <p className="text-lg font-bold sm:text-2xl">{communityCount?.toLocaleString() || 0}</p>
                                <p className="text-xs text-white/80">Communities</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick stats */}
            {isInfluencer && (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <StatCard icon={Users} value={communityCount} label="Communities Joined" />
                    <StatCard
                        icon={BadgeCheck}
                        value={isVerified ? "Verified" : "Pending"}
                        label="Verification Status"
                    />
                    {level != null && <LevelStatCard level={level} />}
                    {mainPlatform && (
                        <StatCard icon={PlatformIcon} value={followerCount.toLocaleString()} label="Followers" />
                    )}
                </div>
            )}

            {/* Lower section — stacked on mobile, two columns on desktop */}
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                {/* Influencer-only links */}
                {isInfluencer && (
                    <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
                        <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                            Influencer Tools
                        </p>
                        {INFLUENCER_LINKS.map((link) => (
                            <MenuItem
                                key={link.to}
                                icon={link.icon}
                                label={link.label}
                                onClick={() => navigate(link.to)}
                            />
                        ))}
                    </div>
                )}

                {/* Account settings — shared by every account type */}
                <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
                    <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        Account
                    </p>
                    <MenuItem
                        icon={Lock}
                        label="Change Password"
                        onClick={() => navigate("/settings/password")}
                    />
                    <MenuItem
                        icon={LogOut}
                        label={signingOut ? "Signing out..." : "Sign Out"}
                        tone="danger"
                        onClick={handleSignOut}
                    />
                </div>
            </div>

            {signOutError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>Couldn't sign out. Please try again.</span>
                </div>
            )}
        </div>
    );
};

export default Profile;