import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Loader2,
    AlertCircle,
    Megaphone,
    Users,
    ChevronRight,
    ChevronLeft,
    MessageCircle,
    Ban,
} from "lucide-react";

import Title from "../../components/common/Title";
import useApi from "../../hooks/useApi";

const LIMIT = 20;

const STATUS_TABS = [
    { label: "All", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Active", value: "active" },
    { label: "Closed", value: "closed" },
    { label: "Archived", value: "archived" },
];

const STATUS_STYLE = {
    pending: "bg-yellow-100 text-yellow-700",
    active: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-600",
    archived: "bg-gray-100 text-gray-500",
};

const formatDateTime = (value) =>
    value
        ? new Date(value).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : null;

// Chats only carry `campaign`/`community` when the API included them
// (business & influencer roles). Fall back gracefully otherwise.
function chatTitle(chat) {
    if (chat.type === "campaign") {
        return chat.campaign?.title || chat.campaign?.name || "Campaign Chat";
    }
    return chat.community?.name || chat.community?.title || "Community Chat";
}

function TypeIcon({ type }) {
    const Icon = type === "campaign" ? Megaphone : Users;
    return (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Icon size={17} />
        </span>
    );
}

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLE[status] || "bg-gray-100 text-gray-600"
                }`}
        >
            {status}
        </span>
    );
}

function ChatRow({ chat, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full flex-col gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4"
        >
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <TypeIcon type={chat.type} />

                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-gray-800">{chatTitle(chat)}</p>
                        {!chat.is_allowed && (
                            <span title="Chatting disabled">
                                <Ban size={12} className="shrink-0 text-rose-400" />
                            </span>
                        )}
                    </div>
                    <p className="truncate text-xs text-gray-500">
                        Started by {chat.created_by?.name_or_company_name || "Unknown"}
                        <span className="text-gray-300"> · </span>
                        {formatDateTime(chat.createdAt)}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 pl-[52px] sm:justify-end sm:gap-4 sm:pl-0">
                <div className="min-w-0 text-left sm:w-40 sm:text-right">
                    <p className="truncate text-xs font-medium text-gray-600">
                        {chat.agent?.name_or_company_name || "Unassigned"}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">Agent</p>
                </div>

                <StatusBadge status={chat.status} />

                <ChevronRight size={16} className="hidden shrink-0 text-gray-300 sm:block" />
            </div>
        </button>
    );
}

export default function ChatList() {
    const navigate = useNavigate();
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);

    const chatsApi = useApi({
        request: ({ page: p, status: s }) => ({
            method: "GET",
            path: "/chats",
            query: { page: p, limit: LIMIT, ...(s ? { status: s } : {}) },
            manual: true,
        }),
    });

    const [chats, setChats] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchChats = async () => {
            const response = await chatsApi.execute({ page, status });
            if (response?.success) {

                console.log(response?.data?.data );
                
                const data = response?.data?.data || response?.data;
                setChats(data || data.chats || []);
                setTotal(data.count ?? data.total ?? 0);
            }
        };

        fetchChats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, status]);

    const totalPages = Math.max(1, Math.ceil(total / LIMIT));

    const changeStatus = (value) => {
        setStatus(value);
        setPage(1);
    };

    return (
        <div className="space-y-4 h-full flex-1">
            <Title titel="Chats" disc="Conversations across campaigns and communities." />

            {/* Status tabs */}
            <div className="flex gap-2 mt-3 overflow-x-auto ">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => changeStatus(tab.value)}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${status === tab.value
                            ? "bg-primary text-white"
                            : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="rounded-lg -mx-4 border-t border-gray-200 bg-white">
                {chatsApi.loading ? (
                    <div className="flex min-h-[300px] items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 size={26} className="animate-spin text-violet-600" />
                            <p className="text-sm font-medium text-gray-500">Loading chats...</p>
                        </div>
                    </div>
                ) : chatsApi.error ? (
                    <div className="flex items-start gap-2 p-4 text-xs font-medium text-red-600">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>Couldn't load chats. Please try again.</span>
                    </div>
                ) : chats.length === 0 ? (
                    <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 px-4 text-center">
                        <MessageCircle size={26} className="text-gray-300" />
                        <p className="text-sm font-semibold text-gray-600">No chats yet</p>
                        <p className="text-xs text-gray-400">
                            {status ? `No ${status} chats to show.` : "Conversations will show up here."}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {chats.map((chat) => (
                            <ChatRow key={chat.id} chat={chat} onClick={() => navigate(`/campaigns/${chat?.campaign?.id}/chat`)} />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {total > LIMIT && (
                <div className="flex items-center justify-between px-1 text-xs font-medium text-gray-500">
                    <span>
                        Page {page} of {totalPages} · {total} chats
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}