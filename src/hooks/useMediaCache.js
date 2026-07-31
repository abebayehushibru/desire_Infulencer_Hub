import { useEffect, useState, useRef } from "react";
import axios from "axios";
import mediaDB from "../config/db";

const memoryCache = new Map(); // instant access (WhatsApp-style)
const objectUrlCache = new Map(); // prevent duplicate ObjectURLs

export default function useMediaCache({ id, url, type, mimeType }) {
  const [localUrl, setLocalUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const objectUrlRef = useRef(null);

  useEffect(() => {
    if (!url || !id) return;

    let cancelled = false;

    const getFile = async () => {
      try {
        setLoading(true);

        // ==============================
        // 1. MEMORY CACHE (INSTANT)
        // ==============================
        if (memoryCache.has(id)) {
          setLocalUrl(memoryCache.get(id));
          setLoading(false);
          return;
        }

        await mediaDB.open();

        // ==============================
        // 2. INDEXEDDB CACHE (OFFLINE)
        // ==============================
        const cached = await mediaDB.media.get(id);

        if (cached?.blob) {
          const cachedUrl =
            objectUrlCache.get(id) 
            URL.createObjectURL(cached.blob);

          objectUrlCache.set(id, cachedUrl);
          memoryCache.set(id, cachedUrl);

          if (!cancelled) {
            setLocalUrl(cachedUrl);
            setLoading(false);
          }
          return;
        }

        // ==============================
        // 3. NETWORK DOWNLOAD (LAZY)
        // ==============================
        const response = await axios.get(url, {
          responseType: "blob",
        });

        const blob = response.data;

        if (!blob || blob.size === 0) {
          throw new Error("Empty file");
        }

        const finalUrl =
          objectUrlCache.get(id) 
          URL.createObjectURL(blob);

        objectUrlCache.set(id, finalUrl);
        memoryCache.set(id, finalUrl);

        // save offline
        await mediaDB.media.put({
          id,
          url,
          blob,
          type,
          mimeType: mimeType || blob.type,
          updatedAt: Date.now(),
        });

        if (!cancelled) {
          setLocalUrl(finalUrl);
        }

      } catch (err) {
        console.error("Media error:", err);

        if (!cancelled) setLocalUrl(url); // fallback direct URL
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    getFile();

    return () => {
      cancelled = true;

      // DO NOT revoke if reused (WhatsApp behavior)
      const url = objectUrlRef.current;

      if (
        url &&
        !Array.from(memoryCache.values()).includes(url)
      ) {
        URL.revokeObjectURL(url);
      }
    };
  }, [id, url, type, mimeType]);

  return { localUrl, loading };
}