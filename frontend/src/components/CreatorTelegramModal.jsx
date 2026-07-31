import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X } from "lucide-react";

const DEFAULT_TELEGRAM_URL = "https://t.me/amanTeckSolution";//just for test
// const DEFAULT_TELEGRAM_URL = "https://t.me/YOUR_TELEGRAM_LINK";

function normalizeTelegramUrl(url) {
  const rawUrl = String(url || "").trim();

  if (!rawUrl) {
    return DEFAULT_TELEGRAM_URL;
  }

  if (/^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }

  return `https://${rawUrl.replace(/^\/\//, "")}`;
}


export default function CreatorTelegramModal({ open, onClose, telegramUrl = DEFAULT_TELEGRAM_URL }) {
  const closeButtonRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);
  const resolvedTelegramUrl = useMemo(() => normalizeTelegramUrl(telegramUrl), [telegramUrl]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    previouslyFocusedElementRef.current = document.activeElement;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = closeButtonRef.current
        ? closeButtonRef.current.closest("[data-modal-content]")?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        : [];

      if (!focusableElements || focusableElements.length === 0) {
        return;
      }

      const focusable = Array.from(focusableElements).filter((element) => !element.hasAttribute("disabled"));
      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
      body.style.overflow = previousOverflow;
      previouslyFocusedElementRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6 sm:px-6"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose?.();
            }
          }}
        >
          <motion.div
            className="absolute inset-0 bg-primary backdrop-blur-sm"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="creator-telegram-modal-title"
            aria-describedby="creator-telegram-modal-description"
            data-modal-content
            className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-white p-5 shadow-2xl shadow-slate-950/25 sm:p-6"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-sm">
                  <Send size={24} />
                </div>
                <div>
                  <h2 id="creator-telegram-modal-title" className="text-xl font-semibold text-slate-900 sm:text-2xl">
                    Join Our Creator Community
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 sm:text-[15px]">
                    Creator registration is currently managed through our official Telegram community. Join the group to receive onboarding instructions, updates, and support.
                  </p>
                </div>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div id="creator-telegram-modal-description" className="sr-only">
              Creator registration is currently managed through our official Telegram community. Join the group to receive onboarding instructions, updates, and support.
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                Close
              </button>
              <a
                href={resolvedTelegramUrl}
                target="_blank"
                rel="noreferrer noopener"
                onClick={(event) => {
                  event.preventDefault();
                  window.open(resolvedTelegramUrl, "_blank", "noopener,noreferrer");
                }}
                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                Open Telegram
              </a>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}