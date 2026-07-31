import { File, Mic, Send } from "lucide-react";

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

  const handleSend = async () => {
    if (pendingImage) {
      await sendImage(text);
      setText("");
    } else if (text.trim()) {
      await sendText(text);
      setText("");
    }
  };

  return (
    <div className="border-t border-gray-200 p-3 bg-white">
      {pendingImage && (
        <div className="flex items-center gap-2 mb-2">
          <img
            src={pendingImage.previewUrl}
            className="w-14 h-14 object-cover rounded-md"
          />
          <button
            onClick={clearPendingImage}
            className="text-sm text-gray-500 hover:text-red-500"
          >
            Remove
          </button>
        </div>
      )}

      {isRecording ? (
        <div className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2">
          <span className="text-red-600 text-sm font-medium">
            Recording… {String(Math.floor(recordingTime / 60)).padStart(2, "0")}:
            {String(recordingTime % 60).padStart(2, "0")}
          </span>
          <div className="flex gap-2">
            <button onClick={cancelRecording} className="text-sm text-gray-500">
              Cancel
            </button>
            <button
              onClick={sendVoice}
              disabled={sending}
              className="text-sm text-white bg-blue-600 px-3 py-1 rounded-md disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => selectImage(e.target.files?.[0])}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Attach photo"
          >
            <File/>
          </button>

          <button
            onClick={startRecording}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Record voice message"
          >
            <Mic/>
          </button>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message…"
            className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={sending}
          />

          <button
            onClick={handleSend}
            disabled={sending || (!text.trim() && !pendingImage)}
            className="p-2 rounded-full bg-blue-600 text-white disabled:opacity-40"
          >
            {sending ? "...." :<Send/>}
          </button>
        </div>
      )}
    </div>
  );
}