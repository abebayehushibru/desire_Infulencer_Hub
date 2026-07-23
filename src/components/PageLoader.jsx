export default function PageLoader({ fullScreen = false, label = "Loading..." }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${
        fullScreen ? "fixed inset-0 z-50 bg-white/80 backdrop-blur-sm" : "min-h-[400px] relative flex-1 h-full w-full"
      }`}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
      {label && <span className="text-sm text-gray-400">{label}</span>}
    </div>
  );
}