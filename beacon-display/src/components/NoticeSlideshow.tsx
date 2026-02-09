import { useState, useEffect, useCallback } from "react";
import { Notice } from "@/types/database";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { saveNotices, getNotices, getMedia } from "@/utils/db";

interface NoticeSlideshowProps {
  notices: Notice[];
  intervalMs?: number; // Auto-advance interval in ms
}

export function NoticeSlideshow({
  notices,
  intervalMs = 10000,
}: NoticeSlideshowProps) {
  const [offlineNotices, setOfflineNotices] = useState<Notice[]>(notices);
  const [mediaMap, setMediaMap] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const noticesPerPage = 2;

  // Update offline notices when prop changes
  useEffect(() => {
    setOfflineNotices(notices);
  }, [notices]);

  // Load notices with online → offline fallback
  useEffect(() => {
    async function loadNotices() {
      const noticeList = notices.length > 0 ? notices : await getNotices();
      if (noticeList.length > 0) {
        setOfflineNotices(noticeList);

        // preload media
        const map: Record<string, string> = {};
        await Promise.all(
          noticeList.map(async (n) => {
            if (n.fileUrl) map[n._id] = await getMedia(n.fileUrl);
          }),
        );
        setMediaMap(map);
      }

      // If offline, STOP here
      if (!navigator.onLine) return;

      // Fetch fresh data online if not already provided
      if (notices.length === 0) {
        try {
          const res = await fetch(
            "http://localhost:5000/api/notices/published",
          );
          const data = await res.json();

          await saveNotices(data);
          setOfflineNotices(data);

          const map: Record<string, string> = {};
          await Promise.all(
            data.map(async (n: Notice) => {
              if (n.fileUrl) map[n._id] = await getMedia(n.fileUrl);
            }),
          );
          setMediaMap(map);
        } catch {
          // silent fail — cached data already shown
        }
      }
    }

    loadNotices();

    const handleOnline = () => loadNotices();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [notices]);

  const publishedNotices = offlineNotices.filter((n) => n.is_published);
  const totalPages = Math.ceil(publishedNotices.length / noticesPerPage);

  const goToNext = useCallback(() => {
    if (totalPages <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
      setIsTransitioning(false);
    }, 300);
  }, [totalPages]);

  const goToPrevious = useCallback(() => {
    if (totalPages <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
      setIsTransitioning(false);
    }, 300);
  }, [totalPages]);

  // Auto-advance
  useEffect(() => {
    if (totalPages <= 1) return;
    const interval = setInterval(goToNext, intervalMs);
    return () => clearInterval(interval);
  }, [totalPages, intervalMs, goToNext]);

  // Reset page if notices change
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) setCurrentPage(0);
  }, [totalPages, currentPage]);

  if (publishedNotices.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-lg">
        <div className="text-center p-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-900/50 flex items-center justify-center">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="text-xl font-medium text-slate-300">
            No notices to display
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Notices will appear here when published
          </p>
        </div>
      </div>
    );
  }

  const startIndex = currentPage * noticesPerPage;
  const currentNotices = publishedNotices.slice(
    startIndex,
    startIndex + noticesPerPage,
  );

  const renderNotice = (notice: Notice) => {
    const mediaUrl = mediaMap[notice._id] || notice.fileUrl;
    const isImage = notice?.file_type?.startsWith("image/");
    const isPdf = notice?.file_type === "application/pdf";
    const isVideo = notice?.file_type?.startsWith("video/");

    return (
      <div
        key={notice._id}
        className="flex-1 flex flex-col min-w-0 bg-slate-900 rounded-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 flex-shrink-0">
          <h2 className="text-sm font-semibold truncate">{notice.title}</h2>
          {notice.description && (
            <p className="text-xs text-blue-100 truncate">
              {notice.description}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 relative overflow-hidden bg-slate-800">
          {isImage ? (
            <img
              src={mediaUrl}
              alt={notice.title}
              className="w-full h-full object-contain"
            />
          ) : isVideo ? (
            <video
              src={mediaUrl}
              controls
              className="w-full h-full object-contain"
            />
          ) : isPdf ? (
            <iframe
              src={`${mediaUrl}#toolbar=0&navpanes=0&view=FitH`}
              sandbox=""
              className="w-full h-full border-0"
              title={notice.title}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <FileText className="w-12 h-12 text-blue-400 mb-2" />
              <h3 className="text-lg font-semibold text-slate-200">
                {notice.title}
              </h3>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden rounded-lg bg-slate-900">
      <div className="flex-1 relative overflow-hidden">
        <div
          className={`w-full h-full flex gap-3 p-3 transition-opacity duration-300 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          {currentNotices.map(renderNotice)}
          {currentNotices.length === 1 && (
            <div className="flex-1 flex items-center justify-center bg-slate-800 rounded-lg">
              <p className="text-slate-500 text-sm">End of notices</p>
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {totalPages > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white shadow-lg z-10"
              onClick={goToPrevious}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white shadow-lg z-10"
              onClick={goToNext}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}
      </div>

      {/* Page Indicators */}
      {totalPages > 1 && (
        <div className="bg-slate-800 px-4 py-2 flex items-center justify-center gap-2 flex-shrink-0">
          <span className="text-xs text-slate-400 mr-2">
            {currentPage + 1}/{totalPages}
          </span>
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentPage(index);
                  setIsTransitioning(false);
                }, 300);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentPage
                  ? "bg-blue-500 w-6"
                  : "bg-slate-600 hover:bg-slate-500"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
