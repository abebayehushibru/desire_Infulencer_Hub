import React, { useState } from "react";
import { XCircle, AlertTriangle, Loader2 } from "lucide-react";

export function RejectionModal({ isOpen, onClose, onSubmit, campaignName = "Campaign", title="Campaign" }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Simple text validation
    if (!reason.trim()) {
      setError("Please provide a reason for rejecting this campaign.");
      return;
    }

    if (reason.trim().length < 10) {
      setError("Please provide a more descriptive reason (minimum 10 characters).");
      return;
    }

    try {
      setLoading(true);
      // Calls your API service function passed from parent component
      await onSubmit(reason.trim());
      setReason(""); // Reset field state
      onClose();     // Close window
    } catch (err) {
      setError(err.message || "Failed to submit rejection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md overflow-hidden bg-white border border-gray-100 shadow-2xl rounded-lg animate-scale-up">
        
        {/* Header Block */}
        <div className="flex items-start gap-3 p-5 bg-orange-50/50">
          <div className="p-2 text-orange-600 bg-orange-100 rounded-xl">
            <AlertTriangle size={22} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Reject {title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Are you sure you want to reject <span className="font-medium text-gray-700">"{campaignName}"</span>?
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Reason for Rejection
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide constructive feedback for the creator (e.g., Budget mismatched, timeline conflicts, missing assets...)"
              disabled={loading}
              className={`w-full rounded-xl border p-3 text-sm text-gray-700 placeholder-gray-400 transition outline-none resize-none focus:ring-2 ${
                error 
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100" 
                  : "border-gray-200 focus:border-orange-400 focus:ring-orange-100"
              }`}
            />
            
            {/* Visual Error Message */}
            {error && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 font-medium">
                <XCircle size={13} /> {error}
              </p>
            )}
          </div>

          {/* Action Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-500 transition border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white transition bg-red-600 rounded-lg hover:bg-red-700 shadow-md shadow-red-200 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Submitting...
                </>
              ) : (
                "Confirm Rejection"
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
