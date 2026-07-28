import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  UploadCloud,
  FileVideo,
  FileText,
  Image as ImageIcon,
  X,
  ExternalLink,
} from "lucide-react";

const TYPE_CONFIG = {
  image: {
    icon: ImageIcon,
    accept: "image/*",
    title: "Upload Image",
    hint: "PNG, JPG, WEBP up to 5MB",
    maxSizeMB: 1,
  },
  pdf: {
    icon: FileText,
    accept: "application/pdf",
    title: "Upload PDF",
    hint: "PDF up to 10MB",
    maxSizeMB: 5,
  },
  video: {
    icon: FileVideo,
    accept: "video/*",
    title: "Upload Video",
    hint: "MP4, MOV, AVI up to 100MB",
    maxSizeMB: 30,
  },
  any: {
    icon: UploadCloud,
    accept: "*",
    title: "Upload File",
    hint: "Drag & Drop or click to upload",
    maxSizeMB: 5,
  },
};

/**
 * Infers the practical "kind" of a file (image/pdf/video) for preview
 * purposes — from the explicit `type` prop first, falling back to the
 * File's mime type (new upload) or its extension (existing string URL,
 * e.g. when editing a form pre-filled from the server).
 */
const inferKind = (file, typeProp) => {
  if (typeProp && typeProp !== "any") return typeProp;
  if (!file) return null;

  if (typeof file === "string") {
    const ext = file.split(".").pop()?.toLowerCase();
    if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image";
    if (ext === "pdf") return "pdf";
    if (["mp4", "mov", "avi", "webm"].includes(ext)) return "video";
    return null;
  }

  if (file.type?.startsWith("image")) return "image";
  if (file.type === "application/pdf") return "pdf";
  if (file.type?.startsWith("video")) return "video";
  return null;
};

const getFileName = (file) =>
  typeof file === "string" ? file.split("/").pop() : file?.name;

const getFileSizeLabel = (file) => {
  if (!file || typeof file === "string" || !file.size) return null;
  return `${(file.size / 1024 / 1024).toFixed(2)} MB`;
};

const FileUpload = ({
  label,
  name,
  value,
  onChange,
  type = "any", // "image" | "pdf" | "video" | "any"
  accept, // overrides the type default if provided
  hint, // overrides the type default if provided
  maxSizeMB, // overrides the type default if provided
  required = false,
  error,
  disabled = false,
}) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState(null);

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.any;
  const resolvedAccept = accept || config.accept;
  const resolvedHint = hint || config.hint;
  const resolvedMaxSizeMB = maxSizeMB ?? config.maxSizeMB;

  const file = value;
  const kind = inferKind(file, type);
  const Icon = TYPE_CONFIG[kind]?.icon || UploadCloud;

  const displayedError = error || localError;

  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    if (typeof file === "string") {
      setPreviewUrl(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const validate = (selectedFile) => {
    if (!selectedFile) return null;

    if (resolvedMaxSizeMB && selectedFile.size > resolvedMaxSizeMB * 1024 * 1024) {
      return `File is too large. Max size is ${resolvedMaxSizeMB}MB.`;
    }

    return null;
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const validationError = validate(selectedFile);

    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError(null);

    onChange?.({
      target: { name, value: selectedFile },
    });
  };

  const removeFile = () => {
    setLocalError(null);

    onChange?.({
      target: { name, value: null },
    });

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full h-full">
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        onClick={() => !disabled && inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) handleFile(e.dataTransfer.files[0]);
        }}
        className={`
          border-2 border-dashed rounded-xl
          p-8
          cursor-pointer
          text-center
          transition

          ${dragging ? "border-primary bg-violet-50" : "border-gray-300"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-violet-500"}
        `}
      >
        {!file ? (
          <>
            <UploadCloud className="mx-auto text-primary" size={40} />
            <h3 className="mt-3 font-semibold">{config.title}</h3>
            <p className="text-sm text-gray-500 mt-2">Drag & Drop or Click to Upload</p>
            <p className="text-xs text-gray-400 mt-2">{resolvedHint}</p>
          </>
        ) : (
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 min-w-0">
              {kind === "image" && previewUrl ? (
                <img
                  src={previewUrl}
                  alt={getFileName(file)}
                  className="h-10 w-10 rounded-lg object-cover shrink-0"
                />
              ) : (
                <Icon className="text-primary shrink-0" />
              )}

              <div className="min-w-0 text-left">
                <h4 className="font-medium truncate">{getFileName(file)}</h4>
                {getFileSizeLabel(file) && (
                  <p className="text-xs text-gray-500">{getFileSizeLabel(file)}</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              disabled={disabled}
              className="text-red-500 hover:bg-red-100 rounded-full p-2 shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          hidden
          type="file"
          accept={resolvedAccept}
          disabled={disabled}
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {/* Large preview beneath the dropzone */}
      {kind === "video" && previewUrl && (
        <video controls className="mt-4 rounded-xl w-full max-h-72" src={previewUrl} />
      )}

      {kind === "image" && previewUrl && (
        <img
          src={previewUrl}
          alt={getFileName(file)}
          className="mt-4 rounded-xl w-full max-h-72 object-contain bg-gray-50"
        />
      )}

      {kind === "pdf" && previewUrl && (
        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ExternalLink size={14} />
          View PDF
        </a>
      )}

      {displayedError && <p className="text-red-500 mt-2 text-sm">{displayedError}</p>}
    </div>
  );
};

export default FileUpload;