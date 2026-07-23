import { useState, useCallback, useRef, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

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
    
    // Check if payload is FormData
    const isFormData = payload instanceof FormData;
    // Safely extract successMsg based on type
    const successMsg = isFormData ? payload.get("successMsg") : payload?.successMsg;

    if (controller.current) {
        controller.current.abort();
    }

    controller.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
        // Construct final request options
        const requestOptions = requestRef.current(payload);

        const result = await api({
            signal: controller.current.signal,
            ...requestOptions,
        });

        // Prevent updating state if a newer request has started
        if (id !== requestId.current) return;

        setData(result);
        
        // Only toast success AFTER the API request succeeds
        if (successMsg) {
            toast.success(successMsg);
        }

        return { success: true, data: result };
    } catch (err) {
        console.log("err", err);
        
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
            return { success: false, error: err?.code || err?.name, err };
        }
        
        const message = err?.response?.data?.message || err?.message || "Something went wrong";
        setError(message);
        toast.error(message);
        return { success: false, error: message, err };
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