import { X, Send, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function TelegramContactModal({
  open,
  onClose,
  username = "@InfluencerSupport",
}) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const copyUsername = async () => {
    await navigator.clipboard.writeText(username);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#16115A] via-[#2E1C8D] to-[#16115A] px-6 py-8 text-white">

          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 hover:bg-white/30"
          >
            <X size={18} />
          </button>

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15">
            <Send size={42} />
          </div>

          <h2 className="mt-5 text-center text-2xl font-bold">
            Telegram Support
          </h2>

          <p className="mt-2 text-center text-sm text-white/80">
            Contact our support team through Telegram.
          </p>
        </div>

        {/* Body */}
        <div className="space-y-5 p-6">

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Telegram Username
            </p>

            <div className="mt-2 flex items-center justify-between">
              <h3 className="font-semibold text-primary text-lg">
                {username}
              </h3>

              <button
                onClick={copyUsername}
                className="rounded-xl bg-primary/10 p-2 text-primary hover:bg-primary hover:text-white transition"
              >
                {copied ? (
                  <Check size={18} />
                ) : (
                  <Copy size={18} />
                )}
              </button>
            </div>
          </div>

          <a
            href={`https://t.me/${username.replace("@", "")}`}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#229ED9] py-3 font-semibold text-white transition hover:opacity-90"
          >
            <Send size={18} />
            Open Telegram
          </a>

          <button
            onClick={onClose}
            className="w-full rounded-2xl border border-gray-200 py-3 font-medium text-gray-600 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}