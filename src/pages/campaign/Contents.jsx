import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FileText, PlayCircle, Download, Film, Loader2 } from "lucide-react";
import PlatformVideosList from "../../components/PlatformVideosList";
import useApi from "../../hooks/useApi";

// Adjust this if your backend serves documents at a different path
const DOCUMENT_URL = (docId) => `/documents/${docId}`;

const humanizeDocLabel = (key) => {
  const labels = {
    campaign_document_id: "Campaign Brief",
    photo_document_id: "Campaign Photo",
  };
  return labels[key] || "Document";
};

export default function Contents() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(0);

  const getCampaignApi = useApi({
    request: () => ({ method: "GET", path: `/campaigns/${id}`, manual: true }),
  });

  useEffect(() => {
    if (!id) return;

    (async () => {
      const res = await getCampaignApi.execute();
      const payload = res?.data?.data || res?.data;
      if (res?.success && payload) {
        setCampaign(payload);
      }
    })();
  }, [id]);

  if (getCampaignApi.loading || !campaign) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white py-24 text-gray-400">
        <Loader2 size={24} className="animate-spin text-primary" />
        <span className="text-sm">Loading content…</span>
      </div>
    );
  }

  // Normalize videos: use campaign.videos[] if present, otherwise fall back
  // to the single video/video_document_id fields on the campaign object.
  const videos = Array.isArray(campaign.videos) && campaign.videos.length
    ? campaign.videos
    : campaign.video || campaign.video_document_id
      ? [
        {
          id: campaign.video_document_id || "video-0",
          title: campaign.title ? `${campaign.title} — Video` : "Campaign Video",
          duration: campaign.video_duration || null,
          url: campaign.video || DOCUMENT_URL(campaign.video_document_id),
        },
      ]
      : [];

  // Normalize documents: use campaign.documents[] if present, otherwise
  // build entries from the known single-document ID fields.
  const documents = Array.isArray(campaign.documents) && campaign.documents.length
    ? campaign.documents
    : ["campaign_document_id", "photo_document_id"]
      .filter((key) => campaign[key])
      .map((key) => ({
        id: campaign[key],
        name: humanizeDocLabel(key),
        size: null,
        url: DOCUMENT_URL(campaign[key]),
      }));

  const hasVideos = videos.length > 0;
  const hasDocs = documents.length > 0;
  const currentVideo = hasVideos ? videos[selectedVideo] : null;

  const knownSizeMb = documents.reduce((sum, d) => {
    const n = parseFloat(d.size);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  return ( 
    <div className="grid gap-4 mt-4 text-primary lg:grid-cols-3">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in { animation: fadeSlideUp 0.45s ease-out both; }
      `}</style>

      {/* ================= LEFT SIDE ================= */}
      <div className="animate-in rounded-lg border border-gray-200 bg-white p-5 transition-shadow duration-300 hover:shadow-md lg:col-span-2">
        <h2 className="mb-4 text-lg font-semibold">Campaign Videos</h2>

        {hasVideos ? (
          <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-black">
              <video
                key={currentVideo.url}
                src={currentVideo.url}
                controls
                className="h-[220px] w-full object-cover transition-opacity duration-300 sm:h-[280px] lg:h-[320px]" />
            </div>

            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{currentVideo.title}</h3>
                {currentVideo.duration && (
                  <p className="text-sm text-gray-500">Duration: {currentVideo.duration}</p>
                )}
              </div>
              {videos.length > 1 && (
                <span className="shrink-0 rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                  {selectedVideo + 1} / {videos.length}
                </span>
              )}
            </div>

            {videos.length > 1 && (
              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                {videos.map((video, index) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(index)}
                    className={`
                      flex w-full items-center gap-3 rounded-xl border p-3 text-left
                      transition-all duration-200
                      ${index === selectedVideo
                        ? "border-primary/30 bg-primary/5"
                        : "border-gray-200 hover:bg-gray-50"}
                    `}
                  >
                    <PlayCircle
                      size={18}
                      className={index === selectedVideo ? "text-primary" : "text-gray-400"} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{video.title}</p>
                      {video.duration && (
                        <p className="text-xs text-gray-400">{video.duration}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={Film}
            title="No videos yet"
            description="Videos submitted for this campaign will appear here." />
        )}
      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className="space-y-4">
        {/* Documents */}
        <div
          className="animate-in rounded-lg border border-gray-200 bg-white p-5 transition-shadow duration-300 hover:shadow-md"
          style={{ animationDelay: "80ms" }}
        >
          <h2 className="mb-4 text-lg font-semibold">Campaign Documents</h2>

          {hasDocs ? (
            <div className="space-y-3">
              {documents.map((doc, i) => (
                <div
                  key={doc.id}
                  className="animate-in flex items-center justify-between rounded-xl border border-gray-200 p-3 transition-colors duration-200 hover:bg-gray-50"
                  style={{ animationDelay: `${120 + i * 60}ms` }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="shrink-0 text-red-500" size={20} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-primary/60">{doc.size || "Unknown size"}</p>
                    </div>
                  </div>


                  <a href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-primary transition-transform duration-200 hover:text-primary/80 active:scale-90"
                    aria-label={`Download ${doc.name}`}
                  >
                    <Download size={18} />
                  </a>
                </div>))}</div>) : (
            <EmptyState
              icon={FileText}
              title="No documents yet"
              description="Briefs and guidelines will appear here."
              compact />
          )}
        </div>

        {/* Summary Card */}
        <div
          className="animate-in mb-4 h-fit flex-1 rounded-lg border border-gray-200 bg-white p-5 transition-shadow duration-300 hover:shadow-md"
          style={{ animationDelay: "160ms" }}
        >
          <h2 className="mb-4 text-lg font-semibold">Content Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Videos</span>
              <span className="font-semibold tabular-nums">{videos.length}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Documents</span>
              <span className="font-semibold tabular-nums">{documents.length}</span>
            </div>

            <div className="flex justify-between border-t border-gray-100 pt-3">
              <span className="text-gray-500">Total Size</span>
              <span className="font-semibold tabular-nums">
                {knownSizeMb > 0 ? `${knownSizeMb.toFixed(1)} MB` : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        className="animate-in col-span-full hidden md:block"
        style={{ animationDelay: "220ms" }}
      >
        <PlatformVideosList campaignId={id} />
      </div>
    </div>
    

    );
}

    function EmptyState({icon: Icon, title, description, compact }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-center ${compact ? "py-8" : "py-16"
        }`}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
        <Icon size={20} className="text-gray-300" />
      </div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-1 max-w-[220px] text-xs text-gray-400">{description}</p>
    </div>
    );
}