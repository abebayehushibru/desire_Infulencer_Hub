import { useEffect } from "react";
import { X, Download } from "lucide-react";

export default function MessageImageViewer({
  open,
  image,
  onClose,
}) {
  useEffect(() => {
    if (!open) return;

    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open || !image) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div className="absolute top-5 right-5 flex items-center gap-2">
        <a
          href={image}
          download
          onClick={(e) => e.stopPropagation()}
          className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition"
        >
          <Download size={20} />
        </a>

        <button
          onClick={onClose}
          className="w-11 h-11 rounded-full bg-black/50 hover:bg-red-600 text-white flex items-center justify-center transition"
        >
          <X size={22} />
        </button>
      </div>

      {/* Image */}
      <img
        src={image}
        alt="Message"
        onClick={(e) => e.stopPropagation()}
        className="
          max-w-[95vw]
          max-h-[92vh]
          object-contain
          rounded-lg
          shadow-2xl
          transition-transform
          duration-300
          hover:scale-[1.02]
          select-none
        "
      />
    </div>
  );
}