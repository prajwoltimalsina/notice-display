import { useState, useEffect, useCallback } from "react";
import { Notice } from "@/types/database";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useSocket } from "./useSocket";

export function useNotices(publicOnly = false) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotices = useCallback(async () => {
    try {
      const data = publicOnly
        ? await api.notices.getPublished()
        : await api.notices.getAll();
      console.log("Fetched notices:", data);
      setNotices(data);
    } catch (error) {
      toast.error("Failed to load notices");
      console.error("Error fetching notices:", error);
    }
    setIsLoading(false);
  }, [publicOnly]);

  // Socket.io real-time updates
  useSocket({
    onNoticeCreated: (notice) => {
      if (!publicOnly || notice.is_published) {
        setNotices((prev) => [notice, ...prev]);
        toast.success("New notice added");
      }
    },
    onNoticeUpdated: (notice) => {
      setNotices((prev) =>
        prev.map((n) => (n._id === notice._id ? notice : n)),
      );
    },
    onNoticeDeleted: ({ _id }) => {
      setNotices((prev) => prev.filter((n) => n._id !== _id));
    },
    onNoticeToggled: (notice) => {
      if (publicOnly) {
        if (notice.is_published) {
          setNotices((prev) => [
            notice,
            ...prev.filter((n) => n._id !== notice._id),
          ]);
        } else {
          setNotices((prev) => prev.filter((n) => n._id !== notice._id));
        }
      } else {
        setNotices((prev) =>
          prev.map((n) => (n._id === notice._id ? notice : n)),
        );
      }
    },
  });

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // Upload file and create notice in one request
  const createNotice = async (
    file: File,
    noticeData: {
      title: string;
      description?: string;
      is_published: boolean;
      created_by: string;
    },
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", noticeData.title);
      if (noticeData.description) {
        formData.append("description", noticeData.description);
      }
      formData.append("is_published", String(noticeData.is_published));
      formData.append(
        "status",
        noticeData.is_published ? "published" : "draft",
      );
      formData.append("created_by", noticeData.created_by);
      formData.append("file_type", file.type);

      const result = await api.notices.upload(formData);
      // Socket will handle adding to state
      toast.success("Notice created successfully");
      return result.notice as Notice;
    } catch (error) {
      toast.error("Failed to create notice");
      throw error;
    }
  };

  const updateNotice = async (id: string, updates: Partial<Notice>) => {
    try {
      const result = await api.notices.update(id, updates);
      // Socket will handle state update
      toast.success("Notice updated successfully");
      return result.notice as Notice;
    } catch (error) {
      toast.error("Failed to update notice");
      throw error;
    }
  };

  const togglePublish = async (id: string) => {
    try {
      const result = await api.notices.togglePublish(id);
      // Socket will handle state update
      toast.success(result.message);
      return result.notice as Notice;
    } catch (error) {
      toast.error("Failed to toggle notice status");
      throw error;
    }
  };

  const deleteNotice = async (id: string) => {
    try {
      await api.notices.delete(id);
      // Socket will handle state update
      toast.success("Notice deleted successfully");
    } catch (error) {
      toast.error("Failed to delete notice");
      throw error;
    }
  };

  return {
    notices,
    isLoading,
    createNotice,
    updateNotice,
    togglePublish,
    deleteNotice,
    refetch: fetchNotices,
  };
}
