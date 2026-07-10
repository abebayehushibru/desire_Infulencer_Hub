import { useState } from "react";
import { FileText, PlayCircle, Download, Eye } from "lucide-react";
import PlatformVideosList from "../../components/PlatformVideosList";

export default function Contents() {
  const [selectedVideo, setSelectedVideo] = useState(0);

  const videos = [
    {
      id: 1,
      title: "Campaign Intro",
      duration: "00:45",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
    },
   
  ];

  const pdfs = [
    {
      id: 1,
      name: "Campaign Brief.pdf",
      size: "2.4 MB",
    },
    {
      id: 2,
      name: "Brand Guidelines.pdf",
      size: "4.1 MB",
    },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-5 text-primary">

      {/* ================= LEFT SIDE ================= */}
      <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-5">

        <h2 className="text-lg font-semibold mb-4">
          Campaign Videos
        </h2>

        {/* Video Player */}
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-black">
          <video
            src={videos[selectedVideo].url}
            controls
            className="w-full h-[320px] object-cover"
          />
        </div>

        <div className="mt-4">
          <h3 className="font-semibold">
            {videos[selectedVideo].title}
          </h3>

          <p className="text-sm text-gray-500">
            Duration: {videos[selectedVideo].duration}
          </p>
        </div>
      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className="space-y-4">

        {/* PDFs */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-lg font-semibold mb-4">
            Campaign PDFs
          </h2>

          <div className="space-y-3">

            {pdfs.map((pdf) => (
              <div
                key={pdf.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-red-500" />

                  <div>
                    <p className="text-sm font-medium">
                      {pdf.name}
                    </p>
                    <p className="text-xs text-primqary/80">
                      {pdf.size}
                    </p>
                  </div>
                </div>

                <button className="text-primary hover:text-primary/80">
                  <Download size={18} />
                </button>
              </div>
            ))}

          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 h-fit flex-1 mb-4">
          <h2 className="text-lg font-semibold mb-4">
            Content Summary
          </h2>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-gray-500">Videos</span>
              <span className="font-semibold">
                {videos.length}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">PDF Files</span>
              <span className="font-semibold">
                {pdfs.length}/2
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Total Size</span>
              <span className="font-semibold">
                6.5 MB
              </span>
            </div>

          </div>

        </div>

      </div>
      <div className=" lg:col-span-4 md:block hidden">
        <PlatformVideosList/>
      </div>

    </div>
  );
}