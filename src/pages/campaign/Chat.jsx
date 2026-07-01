import { useState } from "react";
import { Lock, Video, Paperclip, Send, Copy, Check } from "lucide-react";

const messages = [
  {
    id: 1,
    name: "Sara Beauty",
    role: "Leader",
    time: "10:30 AM",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
    text: "Welcome everyone! Let's discuss how we can promote this course effectively.",
    likes: 8,
  },
  {
    id: 2,
    name: "Abel Tech",
    role: "Gold",
    time: "10:32 AM",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
    text: "I think we should focus on students and young professionals.",
    likes: 5,
  },
  {
    id: 3,
    name: "Lily",
    role: "Gold",
    time: "10:35 AM",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
    text: "Agreed! Short videos on TikTok will work best.",
    likes: 4,
  },
];

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

function CampaignInfoCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4 h-full">
        <h3 className="font-semibold text-xl text-gray-900 ">Campaign Info</h3>

      <div>
        <p className="text-gray-500 text-sm">Business</p>
        <p className="font-medium mt-0.5  text-sm">Daire Online School</p>
      </div>

      <div>
        <p className="text-gray-500 text-sm">Target</p>
        <p className="font-medium mt-0.5  text-sm">Sara Beauty Community</p>
      </div>

      <div className="flex gap-8">
        <div>
          <p className="text-gray-500 text-sm">Start Date</p>
          <p className="font-medium mt-0.5  text-sm">01/05/2024</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">End Date</p>
          <p className="font-medium mt-0.5  text-sm">30/06/2024</p>
        </div>
      </div>

      <div>
        <p className="text-gray-500 text-sm">Tracking</p>
        <p className="font-medium mt-0.5  text-sm">Link &amp; Code</p>
      </div>

      <hr className="border-gray-100" />

      <h3 className="font-semibold text-gray-900  text-sm">Your Tracking Link</h3>

      <CopyField
        label="Tracking Link"
        value="https://influencehub.io/abc123"
      />

      <div>
        <p className="text-gray-500 text-sm">Referral Code</p>
        <div className="flex items-center justify-between gap-2 mt-1">
          <span className="font-medium">SARA01</span>
          <button className="text-gray-400 hover:text-primary" aria-label="Copy referral code">
            <Copy size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CommunityChatCard() {
  const [draft, setDraft] = useState("");

  return (
    <div className="bg-white rounded-lg col-span-2 border border-gray-200 flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Community Chat</h3>
        <span className="flex items-center gap-1.5 bg-purple-50 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
          <Lock size={12} />
          Google Meet
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        {messages.map((m) => (
          <div key={m.id} className="flex gap-3">
            <img
              src={m.avatar}
              alt={m.name}
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm text-gray-900">{m.name}</span>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${roleStyles[m.role]}`}
                >
                  {m.role}
                </span>
                <span className="text-xs text-gray-400">{m.time}</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{m.text}</p>
              <button className="flex items-center gap-1 mt-1.5 text-amber-500 text-xs font-medium">
                👍 {m.likes}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100">
        <button className="text-gray-400 hover:text-primary p-2" aria-label="Attach file">
          <Paperclip size={18} />
        </button>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          className="bg-primary text-white rounded-xl p-2.5 hover:opacity-90 disabled:opacity-50"
          disabled={!draft.trim()}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

function CampaignContentCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4 h-fit">
      <h3 className="font-semibold text-xl text-gray-900 ">Campaign Content</h3>

      <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-[5/5]">
        <img
          src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=500&fit=crop&crop=faces"
          alt="Campaign content preview"
          className="w-full h-full object-cover opacity-90"
        />
        <button
          className="absolute inset-0 flex items-center justify-center"
          aria-label="Play video"
        >
          <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
            <Video size={22} className="text-gray-900 ml-0.5" />
          </span>
        </button>
        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
          02:45
        </span>
      </div>

      <div>
        <p className="text-gray-500 text-sm">Description</p>
        <p className="text-sm text-gray-700 mt-1">
          Promote our online English course. Get 40% commission for every
          successful sale.
        </p>
      </div>

      <CopyField
        label="Meeting Link"
        value="https://meet.google.com/abc-defg-hij"
      />
    </div>
  );
}

export default function Chat() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <CampaignInfoCard />
      <CommunityChatCard />
      <CampaignContentCard />
    </div>
  );
}
