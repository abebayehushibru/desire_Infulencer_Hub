import { Eye, ExternalLink, Video } from "lucide-react";
import Pagination from "./Pagination";
import FilterBar from "./FilterBar";
import { useState } from "react";
import Button from "./common/Button";

export default function PlatformVideosList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const platformVideos = [
    {
      id: 1,
      title: "Viral Fall Collection Reveal",
      platform: "TikTok",
      views: "1.2M",
      url: "https://tiktok.com",
      color: "border-pink-500/20 hover:bg-pink-50/30",
      badgeColor: "bg-black text-white"
    },
    {
      id: 2,
      title: "Behind The Scenes: Summer Shoot",
      platform: "Instagram Reels",
      views: "450K",
      url: "https://instagram.com",
      color: "border-purple-500/20 hover:bg-purple-50/30",
      badgeColor: "bg-gradient-to-tr from-yellow-500 via-purple-500 to-pink-500 text-white"
    },
    {
      id: 3,
      title: "Product Deep-Dive & Tutorial",
      platform: "YouTube Short",
      views: "89K",
      url: "https://youtube.com",
      color: "border-red-500/20 hover:bg-red-50/30",
      badgeColor: "bg-red-600 text-white"
    }
  ];

  const handleNavigate = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Platform Distribution</h2>
          <p className="text-xs text-gray-500">Live social media content links</p>
        </div>
       
<FilterBar
  search={search}
  onSearchChange={setSearch}
  searchPlaceholder="Search users..."
  filters={[
    {
      name: "status",
      value: status,
      onChange: setStatus,
      options: [
        { label: "All Platforms", value: "" },
        { label: "TikTok", value: "tiktok" },
        { label: "Instagram", value: "instagram" },
        { label: "Facebook", value: "facebook" },
        { label: "YouTube", value: "youtube" },
      ],
    },
  ]}
>
  <Button className="px-4 py-2 rounded-lg bg-primary text-white">
    Search
  </Button>
</FilterBar>

{/* <Pagination
  page={page}
  totalPages={pagination.totalPages}
  total={pagination.total}
  limit={limit}
  onPageChange={setPage}
  onLimitChange={setLimit}
/> */}
        
      </div>

      {/* Grid Container */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {platformVideos.map((video) => (
          <div
            key={video.id}
            onClick={() => handleNavigate(video.url)}
            className={`group relative flex flex-col justify-between p-4 border rounded-xl cursor-pointer transition-all duration-200 ${video.color}`}
          >
            {/* Top Row: Platform Badge & External Icon */}
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase ${video.badgeColor}`}>
                {video.platform}
              </span>
              <ExternalLink 
                className="text-gray-400 group-hover:text-gray-600 transition-colors" 
                size={14} 
              />
            </div>

            {/* Middle Row: Title */}
            <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
              {video.title}
            </h3>

            {/* Bottom Row: View Counter */}
            <div className="flex items-center gap-1.5 text-gray-500 mt-auto pt-2 border-t border-gray-100">
              <Eye size={14} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-700">{video.views}</span>
              <span className="text-[11px] text-gray-400">views</span>
            </div>
          </div>
        ))}
      </div>
       <Pagination
  page={page}
  totalPages={Math.ceil(40 / limit)}
  total={40}
  limit={limit}
  onPageChange={setPage}
  onLimitChange={setLimit}
/>
    </div>
  );
}
