import { Download, FileText, Mic, AlertCircle, RotateCw, Check, CheckCheck } from 'lucide-react';
import React from 'react';
import env from '../config/env';
import { useAuth } from '../contexts/AuthContext';
import useMediaCache from '../hooks/useMediaCache';
import Avatar from './common/Avatar';


function StatusIndicator({ status, onRetry }) {
  if (status === "sending") {
    return (
      <span className="flex items-center gap-1 text-[11px] text-white/70">
        <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        Sending
      </span>
    );
  }

  if (status === "failed") {
    return (
      <button
        onClick={onRetry}
        className="flex items-center gap-1 text-[11px] font-medium text-red-500 transition hover:text-red-600"
      >
        <AlertCircle size={12} /> Failed · Retry <RotateCw size={11} />
      </button>
    );
  }

  if (status === "sent") {
    return <CheckCheck size={13} className="text-white/70" />;
  }

  return <Check size={13} className="text-gray-300" />;
}

const MessageBubble = ({ m, onRetry }) => {
  const { user } = useAuth();
  const isOwn = m.sender?.id === user?.id; // adjust to your auth field

  // Build the real attachment URL from this message's document — never a
  // hardcoded placeholder. Assumes Document rows store a relative
  // `file_path` (matching the convention used when documents are created
  // elsewhere, e.g. business.service.js).
  const fileUrl = m.document?.file_path
    ? `${env.API_URL}/${m.document.file_path}`
    : null;

  // Hooks must run unconditionally on every render — previously this was
  // called only when m.document?.media_type was truthy, which breaks the
  // Rules of Hooks the moment a text-only message renders alongside one
  // with an attachment. useMediaCache is expected to no-op safely when
  // type/url are undefined.
  const { localUrl, loading } = useMediaCache({
    id: m.id,
    type: m.document?.media_type,
    mimeType: m.document?.mime_type,
    url: fileUrl,
  });

  // Prefer the cached local blob once available; fall back to the network
  // URL while it's loading (or if caching isn't applicable).
  const displayUrl = localUrl || fileUrl;

  const failed = m.status === "failed";

  return (
    <div
      className={`flex w-full  gap-2.5 duration-300 animate-in fade-in slide-in-from-bottom-3 zoom-in-95 ease-out ${
        isOwn ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {m.sender?.photo ? (
        <img
          src={m.sender.photo}
          crossOrigin="anonymous"
          className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
          alt=""
        />
      ) : (
        <Avatar name={m.sender?.name_or_company_name} />
      )}

      <div className={`flex min-w-0 max-w-[75%] flex-col ${isOwn ? "items-end" : "items-start"}`}>
        <div className={`flex items-baseline gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-sm font-semibold text-[var(--color-primary)]">
            {m.sender?.name_or_company_name}
          </span>
          <span className="text-[11px] text-gray-400">
            {new Date(m.created_at || m.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Text message */}
        {m.message && (
          <div
            className={`mt-1.5 inline-block px-4 py-2.5 text-sm rounded-2xl leading-relaxed shadow-sm transition-opacity ${
              isOwn
                ? `rounded-tr-sm bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white ${
                    failed ? "opacity-60" : ""
                  }`
                : "rounded-tl-sm bg-gray-100/80 text-gray-800"
            }`}
          >
            {m.message}
          </div>
        )}

        {/* Attachment preview */}
        {m.document && (
          <div className={`mt-2 w-full min-w-[250px]  rounded-2xl  ${
              isOwn
                ?"rounded-br-none":"rounded-tl-none" } overflow-hidden max-w-xs ${failed ? "opacity-60" : ""}`}>
            {/* Image */}
            {m.document.media_type === "image" && (
              <div className="group relative overflow-hidden border border-gray-200 shadow-sm">
                {loading && !displayUrl ? (
                  <div className="flex h-72 w-full items-center justify-center bg-gray-50">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[var(--color-primary)]" />
                  </div>
                ) : (
                  <img
                    src={displayUrl}
                    alt={m.document.original_name}
                    className="h-72 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                )}
              </div>
            )}

            {/* Video */}
            {m.document.media_type === "video" && (
              <video controls className="w-full border border-gray-200 shadow-sm">
                <source src={displayUrl} type={m.document.mime_type} />
                Your browser does not support video.
              </video>
            )}

            {/* Audio / Voice */}
            {m.document.media_type === "audio" && (
              <div
                className={`flex items-center gap-3 border p-3 shadow-sm ${
                  isOwn
                    ? "border-white/20 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"
                    : "border-[var(--color-primary)]/10 bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    isOwn ? "bg-white/20 text-white" : "bg-[var(--color-primary)] text-white"
                  }`}
                >
                  <Mic size={16} />
                </span>

                <audio controls className="h-9 w-full">
                  <source src={displayUrl} type={m.document.mime_type} />
                </audio>
              </div>
            )}

            {/* PDF / Document / Other */}
            {["pdf", "document", "other"].includes(m.document.media_type) && (
              <a
                href={displayUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="group flex items-center gap-3 border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-[var(--color-primary)]/30 hover:shadow-md"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-tertiary)]/15 text-[var(--color-primary)]">
                  <FileText size={18} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-gray-800">
                    {m.document.original_name}
                  </span>
                  <span className="text-xs text-gray-400">Tap to download</span>
                </span>

                <Download
                  size={16}
                  className="shrink-0 text-gray-300 transition-colors group-hover:text-[var(--color-primary)]"
                />
              </a>
            )}
          </div>
        )}

        {/* Status — only meaningful for the current user's own messages */}
        {isOwn && m.status && (
          <div className="mt-1 px-1">
            <StatusIndicator status={m.status} onRetry={() => onRetry?.(m.id)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;