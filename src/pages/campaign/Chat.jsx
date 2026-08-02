import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useApi from "../../hooks/useApi";
import { Lock, Video, Paperclip, Send, Copy, Check, MessageCircle, Mic,  Menu, X, Info, Trash2, Download, FileText, Building2,
  Users,
  CalendarDays,
  Megaphone,
  BadgeCheck, } from "lucide-react";
import PageLoader from "../../components/PageLoader";
import { useAuth } from "../../contexts/AuthContext";

import useCampaignChat from "../../hooks/chatHook";
import { useRef } from "react";
import env from "../../config/env";
import MessageBubble from "../../components/MessageBubble";
import RoleGuard from "../../router/RoleGuard";
const PURPLE = "#2E1C8D";
const NAVY = "#16115A";
const GOLD = "#FEB209";
function ChatInputBar({ chatHook }) {
  const [text, setText] = useState("");
  const fileInputRef = useRef(null);

  const {
    sending,
    pendingImage,
    selectImage,
    clearPendingImage,
    sendImage,
    isRecording,
    recordingTime,
    startRecording,
    sendVoice,
    cancelRecording,
    sendText,
  } = chatHook;

  const canSend = !sending && (text.trim() || pendingImage);

  const handleSend = async () => {
    if (!canSend) return;

    if (pendingImage) {
      await sendImage(text);
    } else {
      await sendText(text);
    }
    setText("");
  };

  return (
    <div className="border-t flex flex-col  border-gray-100 bg-white  py-3">
      {/* ── Image preview ─────────────────────────────────────────── */}
      {pendingImage && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-2 pr-3">
          <div className="relative shrink-0">
            <img
              src={pendingImage.previewUrl}
              alt="Selected attachment"
              className="h-14 w-14 rounded-lg object-cover"
            />
            <button
              onClick={clearPendingImage}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white shadow-sm transition hover:bg-red-500"
              title="Remove image"
            >
              <X size={12} />
            </button>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-700">Photo attached</p>
            <p className="text-xs text-gray-400">Ready to send</p>
          </div>
        </div>
      )}

      {/* ── Recording state ───────────────────────────────────────── */}
      {isRecording ? (
        <div className="flex items-center justify-between rounded-full border border-red-100 bg-red-50 px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            <span className="text-sm font-medium tabular-nums text-red-600">
              {String(Math.floor(recordingTime / 60)).padStart(2, "0")}:
              {String(recordingTime % 60).padStart(2, "0")}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={cancelRecording}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              title="Cancel recording"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={sendVoice}
              disabled={sending}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white transition disabled:opacity-50"
              title="Send voice message"
            >
              {sending ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Send size={14} />
              )}
            </button>
          </div>
        </div>
      ) : (
        /* ── Normal composer ──────────────────────────────────────── */
        <div className="flex flex-row max-w-full flex-1   w-full items-center gap-1">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden "
            onChange={(e) => selectImage(e.target.files?.[0])}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-primary"
            title="Attach photo"
          >
            <Paperclip size={18} />
          </button>

          <button
            onClick={startRecording}
            className="flex h-9 w-9 hover:bg-gray-100 hover:text-primary shrink-0 items-center justify-center rounded-full text-gray-400 transition"
            title="Record voice message"
          >
            <Mic size={18} />
          </button>
          <div className="flex-1 flex gap-1 items-center relative"> 

            <div className="relative max-w-full inset-0 flex items-center rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none transition focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/30">
             <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSend) handleSend();
            }}
            placeholder="Type a message…"
            className="flex-1   rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/30"
            disabled={sending}
          />
            
            </div>
             <button
            onClick={handleSend}
            disabled={!canSend}
            className="flex h-9 w-9  right-1 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-sm transition disabled:opacity-40 disabled:shadow-none"
          >
            {sending ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Send size={16} />
            )}
          </button>
           
            </div>
{/* 
           */}

         
        </div>
      )}
    </div>
  );
}


const roleStyles = {
  Leader: "bg-purple-100 text-purple-700",
  Gold: "bg-amber-100 text-amber-700",
};

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable, ignore
    }
  };

  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <div className="flex items-center justify-between gap-2 mt-1">
        <a
          href={value}
          className="text-primary text-sm truncate hover:underline"
          title={value}
        >
          {value}
        </a>
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-primary shrink-0"
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}

 function CampaignInfoCard({ chat }) {
  const { user } = useAuth();

  if (!chat) return null;

  const campaign = chat.campaign;

  const target =
    campaign?.community?.name ||
    campaign?.influencer?.name_or_company_name ||
    "-";

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  return (
    <div className="rounded-lg hidden sm:flex flex-col  border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Megaphone size={18} />
          </div>

          <div>
            <h2 className="text-sm font-bold">Campaign Info</h2>
            <p className="text-xs text-white/80">
              Campaign Overview
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3 p-3">
        {/* Campaign */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Campaign
          </p>

          <h3 className="mt-1 text-sm font-semibold text-gray-900">
            {campaign?.title}
          </h3>
        </div>

        {/* Business */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Building2 size={16} />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Business
            </p>

            <p className="font-medium text-xs text-gray-900">
              {campaign?.business?.name_or_company_name}
            </p>
          </div>
        </div>

        {/* Target */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <div className="rounded-lg bg-green-100 p-2 text-green-600">
            <Users size={16} />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Target
            </p>

            <p className="font-medium text-xs text-gray-900">
              {target}
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-200 p-3">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <CalendarDays size={16} />
              <span className="text-xs uppercase tracking-wide text-gray-500">
                Start
              </span>
            </div>

            <p className="font-semibold text-xs text-gray-900">
              {formatDate(campaign?.start_date)}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <CalendarDays size={18} />
              <span className="text-xs uppercase tracking-wide text-gray-500">
                End
              </span>
            </div>

            <p className="font-semibold text-xs text-gray-900">
              {formatDate(campaign?.end_date)}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Status
            </p>

            <span className="mt-1 text-xs inline-flex rounded-full uppercase bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              {campaign?.status}
            </span>
          </div>

          <BadgeCheck
            className="text-green-500"
            size={26}
          />
        </div>
      </div>
    </div>
  );
}
function CommunityChatCard({
  chat,
  chatHook,
  setShowSidebar,showSidebar
}) {
  const { user } = useAuth()
  const {
    messages,
    bottomRef
  } = chatHook;


  return (
    <div className="  h-full flex  bg-white  overflow-hidden pr-1 rounded-lg col-span-2 border border-gray-200 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-100">
        <h3 className="font-semibold capitalize text-gray-900">{chat?.type} Chat</h3>

        <div className=" flex gap-4 pt-3" >
             <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="hidden sm:flex  items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          {showSidebar ? (
            <>
              <X size={18} />
              Hide Details
            </>
          ) : (
            <>
              <Info size={18} />
              Show Details
            </>
          )}
        </button>
         <span className="flex items-center gap-1.5 bg-purple-50 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
          <Lock size={12} />
          Google Meet
        </span>
        </div>
       
      </div>

      <div className="flex-1 max-h-full relative overflow-y-auto flex flex-col ">

        <div className="absolute max-h-full mb-4 space-y-4 px-6 py-4  w-full ">
        {messages?.map((m,key) =>
        <MessageBubble key={key} m={m}/>)}
        </div>
      </div >
      <ChatInputBar chatHook={chatHook} />

    </div >
  );
}

function CampaignContentCard({ chat }) {
  if (!chat) return null;

  const campaign = chat?.campaign;

  return (
    <div className="rounded-xl border hidden sm:flex  flex-col border-gray-200 bg-white p-6 shadow-sm">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            Campaign Content
          </h3>

          <p className="mt-1 text-[10px] text-gray-500">
            View campaign media and description
          </p>
        </div>
      </div>



      {/* Media Preview */}
      <div className="overflow-hidden rounded-xl bg-gray-50">

        {chat?.video?.file_url ? (

          <video
            controls
            className="max-h-[320px] w-full object-cover"
            src={chat.video.file_url}
          />

        ) : chat?.photo?.file_url ? (

          <img
            src={chat.photo.file_url}
            alt="Campaign content"
            className="max-h-[420px] w-full object-cover"
          />

        ) : (

          <div className="flex h-[50px] items-center justify-center text-sm text-gray-400">
            No campaign media available
          </div>

        )}

      </div>



      {/* Campaign Information */}
      <div className="mt-6 space-y-4">

               <div>
          <p className="text-sm font-medium text-gray-500">
            Description
          </p>

          <div className="mt-2 max-h-[180px] overflow-y-auto rounded-lg bg-gray-50 p-4">

            <p className="text-sm leading-relaxed text-gray-700">
              {campaign?.description ||
                "No description available for this campaign."}
            </p>

          </div>
        </div>



        {/* Extra Details */}
        <div className="grid grid-cols-1 gap-4 pt-3 sm:grid-cols-3">

          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">
              Type
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {campaign?.type || "N/A"}
            </p>
          </div>



          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">
              Payout
            </p>

            <p className="mt-1 text-sm font-semibold text-primary">
              {campaign?.amount || 0} ETB
            </p>
          </div>



          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">
              Platform
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {campaign?.platform || "All"}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default function Chat() {
  const { id } = useParams();

  const [showSidebar, setShowSidebar] = useState(true);

  const chatHook = useCampaignChat(id);

  const {
    chat,
    loadingChat,
    createChat,
    creatingChat,
  } = chatHook;

  if (loadingChat) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 h-[500px] flex items-center justify-center">
        <PageLoader label="Loading chat..." />
      </div>
    );
  }
   if (!chat) {
    return (
      <div className="bg-white  sm:mt-4  rounded-xl border border-gray-200 h-[500px] flex flex-col items-center justify-center px-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageCircle className="w-10 h-10 text-primary" />
        </div>

        <h2 className="mt-5 text-xl font-semibold text-gray-900">
          No Campaign Chat
        </h2>

        <p className="mt-2 max-w-md text-center text-gray-500">
          This campaign doesn't have a discussion room yet. Create one to allow
          agents and influencers to communicate.
        </p>

      <RoleGuard allowedRoles={["admin", "super_admin"]}>
          <button
            onClick={createChat}
            disabled={loadingChat}
            className="mt-4 px-3 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loadingChat ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </span>
          ) : (
            "Create Chat"
          )}
        </button>
        </RoleGuard>
      </div>
    );
  }

  return (
    <div className=" sm:mx-4 min-h-full sm:h-[500px] relative w-full flex-1 flex flex-col">
    
    
      
      <div className="space-y-4 flex-1   flex flex-col min-h-full h-full pb-4">


      <div className={`grid grid-cols-1  w-full  min-h-full transition-all duration-300  relative flex-1  gap-4 ${
          showSidebar
            ? "sm:grid-cols-4"
            : "sm:grid-cols-2"
        }  `}>
       {showSidebar && (
          <CampaignInfoCard chat={chat} />
        )}

        <CommunityChatCard
          chat={chat}
          chatHook={chatHook}
          setShowSidebar={setShowSidebar}
          showSidebar={showSidebar}
        />

        {showSidebar && (
          <CampaignContentCard chat={chat} />
        )}
      
      </div>
    </div>
    </div>
  );
}
