import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import useApi from "./useApi";
import toast from "react-hot-toast";

/**
 * Single source of truth for a campaign's chat: fetching, message list,
 * and every way to send a message (text / image / voice), with optimistic
 * updates and retry-on-failure.
 *
 * Expected message shape (both from the server and produced optimistically
 * here) so the UI never has to special-case one vs. the other:
 *   {
 *     id, type: "text" | "image" | "voice",
 *     message: string,       // text content, or image caption
 *     file_url: string|null, // image or voice file, once available
 *     sender: { id, name_or_company_name, photo },
 *     created_at: ISOString,
 *     status: "sending" | "sent" | "failed",
 *   }
 */
function useCampaignChat(id) {
  const { user } = useAuth();

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(true);
  const [sending, setSending] = useState(false);

  // ------- Voice recording state -------
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const streamRef = useRef(null);

  // ------- Photo state -------
  const [pendingImage, setPendingImage] = useState(null); // { file, previewUrl }

  const bottomRef = useRef(null);

  // ---------------- API hooks ----------------

  const campaignChatApi = useApi({
    request: () => ({
      method: "GET",
      path: `/chats/campaign/${id}`,
      manual: true,
    }),
  });

  const createChatApi = useApi({
    request: () => ({
      method: "POST",
      path: `/chats/campaign/${id}`,
      data: { successMsg: "Campaign chat created successfully" },
      manual: true,
    }),
  });

  const sendMessageApi = useApi({
    request: ({ chatId, formData }) => ({
      method: "POST",
      path: `/chats/${chatId}/message`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
      manual: true,
    }),
  });

  // ---------------- Fetch chat (messages come embedded) ----------------

  const fetchChat = useCallback(async () => {
    if (!id) return null;
    setLoadingChat(true);
    try {
      const res = await campaignChatApi.execute();
      const fetchedChat = res?.success ? res.data?.data?.chat : null;
      setChat(fetchedChat || null);
      setMessages(fetchedChat?.messages || []);
      return fetchedChat;
      // eslint-disable-next-line no-useless-return
    } finally {
      setLoadingChat(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchChat();
  }, [fetchChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------- Create chat (when none exists yet) ----------------

  const createChat = async () => {
    const res = await createChatApi.execute();
    if (res?.success) {
      await fetchChat();
    }
    return res;
  };

  // ---------------- Shared send/retry plumbing ----------------

  const buildFormData = (raw) => {
    const formData = new FormData();
    formData.append("type", raw.type);

    if (raw.type === "text") {
      formData.append("content", raw.content);
    }

    if (raw.type === "image") {
      formData.append("content", raw.content || "");
      formData.append("file", raw.file);
    }

    if (raw.type === "voice") {
      formData.append("duration", String(raw.duration));
      formData.append("file", raw.blob, `voice-${Date.now()}.webm`);
    }

    return formData;
  };

  const dispatchMessage = async (tempId, raw) => {
    if (!chat?.id) return;

    setSending(true);

    try {
      const formData = buildFormData(raw);
      const res = await sendMessageApi.execute({ chatId: chat.id, formData });
console.log(res.data?.data?.message);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? res?.success
              ? { ...res.data?.data?.message, status: "sent" }
              : { ...m, status: "failed" }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m))
      );
    } finally {
      setSending(false);
    }
  };

  const retryMessage = (tempId) => {
    const target = messages.find((m) => m.id === tempId);
    if (!target?._raw) return;

    setMessages((prev) =>
      prev.map((m) => (m.id === tempId ? { ...m, status: "sending" } : m))
    );

    dispatchMessage(tempId, target._raw);
  };

  const buildSender = () => ({
    id: user?.id,
    name_or_company_name: user?.name_or_company_name || user?.name || "You",
    photo: user?.photo || null,
  });

  // ---------------- Send text message ----------------

  const sendText = async (text) => {
    if (!text?.trim() || !chat?.id || sending) return;

    const tempId = `temp-${Date.now()}`;
    const raw = { type: "text", content: text };

    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        type: "text",
        message: text,
        file_url: null,
        sender: buildSender(),
        created_at: new Date().toISOString(),
        status: "sending",
        _raw: raw,
      },
    ]);

    await dispatchMessage(tempId, raw);
  };

  // ---------------- Photo message ----------------

  const selectImage = (file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPendingImage({ file, previewUrl });
  };

  const clearPendingImage = () => {
    if (pendingImage?.previewUrl) URL.revokeObjectURL(pendingImage.previewUrl);
    setPendingImage(null);
  };

  const sendImage = async (caption = "") => {
    if (!pendingImage?.file || !chat?.id || sending) return;

    const tempId = `temp-${Date.now()}`;
    const raw = { type: "image", content: caption, file: pendingImage.file };

    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        type: "image",
        message: caption,
        file_url: pendingImage.previewUrl,
        sender: buildSender(),
        created_at: new Date().toISOString(),
        status: "sending",
        _raw: raw,
      },
    ]);

    // Note: we intentionally don't revoke previewUrl here — it's still
    // referenced by the optimistic message above until it's replaced or
    // the component unmounts (handled in the cleanup effect below).
    setPendingImage(null);

    await dispatchMessage(tempId, raw);
  };

  // ---------------- Voice message (mic) ----------------

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err) {
        toast.error("Mic permission denied or unavailable")
      console.error("Mic permission denied or unavailable:", err);
    }
  };

  const stopRecording = () =>
    new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder) return resolve(null);

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        streamRef.current?.getTracks().forEach((track) => track.stop());
        clearInterval(recordingTimerRef.current);
        setIsRecording(false);
        resolve(blob);
      };

      mediaRecorder.stop();
    });

  const cancelRecording = async () => {
    await stopRecording();
    setRecordingTime(0);
  };

  const sendVoice = async () => {
    const blob = await stopRecording();
    if (!blob || !chat?.id || sending) return;

    const duration = recordingTime;
    const tempId = `temp-${Date.now()}`;
    const raw = { type: "voice", duration, blob };

    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        type: "voice",
        message: "",
        file_url: URL.createObjectURL(blob),
        duration,
        sender: buildSender(),
        created_at: new Date().toISOString(),
        status: "sending",
        _raw: raw,
      },
    ]);

    setRecordingTime(0);

    await dispatchMessage(tempId, raw);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(recordingTimerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (pendingImage?.previewUrl) URL.revokeObjectURL(pendingImage.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    chat,
    messages,
    loadingChat,
    sending,
    bottomRef,
    currentUserId: user?.id,

    createChat,
    creatingChat: createChatApi.loading,

    sendText,
    retryMessage,

    // image
    pendingImage,
    selectImage,
    clearPendingImage,
    sendImage,

    // voice
    isRecording,
    recordingTime,
    startRecording,
    cancelRecording,
    sendVoice,
  };
}

export default useCampaignChat;