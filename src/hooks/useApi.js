import { useState, useCallback, useRef, useEffect } from "react";
import api from "../services/api";

export default function useApi({ request, manual = true, initialData = null }) {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const controller = useRef(null);
    const requestId = useRef(0);
    
    // 1. Store request function in a ref so it always points to the latest configuration 
    // without triggering useCallback re-creations.
    const requestRef = useRef(request);
    useEffect(() => {
        requestRef.current = request;
    }, [request]);

    const execute = useCallback(async (payload = {}) => {
        const id = ++requestId.current;

        if (controller.current) {
            controller.current.abort();
        }

        controller.current = new AbortController();
        setLoading(true);
        setError(null);

        try {
            const result = await api({
                signal: controller.current.signal,
                ...requestRef.current(payload), // 2. Call the ref version instead
            });

            if (id !== requestId.current) return;

            setData(result);
            return { success: true, data: result };
        } catch (err) {
            console.log("err",err);
            
            if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
                // If it was deliberately aborted by a fresh user click, return cancellation status
                return { success: false, error: err?.code || err?.name, err };
            }
            const message = err?.message || err?.error || "Something went wrong";
            setError(message);
            return { success: false, error: message,err };
        } finally {
            if (id === requestId.current) {
                setLoading(false);
            }
        }
    }, []);
    
    const reset = useCallback(() => {
        controller.current?.abort();
        setLoading(false);
        setError(null);
        setData(initialData);
    }, [initialData]);

    useEffect(() => {
        if (!manual) {
            execute();
        }
        return () => {
            controller.current?.abort();
        };
    }, [manual, execute]);

    return { data, loading, error, execute, reset, setData };
}