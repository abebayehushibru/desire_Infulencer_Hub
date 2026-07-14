import React, { useRef, useState } from "react";
import {
  UploadCloud,
  FileVideo,
  X,
} from "lucide-react";

const FileUpload = ({
  label,
  name,
  value,
  onChange,
  accept = "*",
  required = false,
  error,
  disabled = false,
}) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const file = value;

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    onChange?.({
      target: {
        name,
        value: selectedFile,
      },
    });
  };

  const removeFile = () => {
    onChange?.({
      target: {
        name,
        value: null,
      },
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

          {required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);

          handleFile(e.dataTransfer.files[0]);
        }}
        className={`
          border-2 border-dashed rounded-xl
          p-8
          cursor-pointer
          text-center
          transition

          ${
            dragging
              ? "border-violet-600 bg-violet-50"
              : "border-gray-300"
          }

          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:border-violet-500"
          }
        `}
      >
        {!file ? (
          <>
            <UploadCloud
              className="mx-auto text-violet-600"
              size={40}
            />

            <h3 className="mt-3 font-semibold">
              Upload Video
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Drag & Drop or Click to Upload
            </p>

            <p className="text-xs text-gray-400 mt-2">
              MP4, MOV, AVI
            </p>
          </>
        ) : (
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <FileVideo className="text-violet-600" />

              <div>
                <h4 className="font-medium">
                  {file.name}
                </h4>

                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)}
                  MB
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="text-red-500 hover:bg-red-100 rounded-full p-2"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          hidden
          type="file"
          accept={accept}
          onChange={(e) =>
            handleFile(e.target.files[0])
          }
        />
      </div>

      {file?.type?.startsWith("video") && (
        <video
          controls
          className="mt-4 rounded-xl w-full max-h-72"
          src={URL.createObjectURL(file)}
        />
      )}

      {error && (
        <p className="text-red-500 mt-2 text-sm">
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;