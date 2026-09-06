"use client";

import React, { useState, useRef } from "react";
import { upload } from "@imagekit/next";
import { Upload, X, Loader2 } from "lucide-react";

export interface UploadedImageResult {
  fileId: string;
  url: string;
  thumbnailUrl?: string;
  name: string;
  filePath: string;
  height?: number;
  width?: number;
  size?: number;
}

interface ImageUploadProps {
  folder?: string;
  onSuccess: (result: UploadedImageResult) => void;
  onError?: (error: Error) => void;
  maxSizeBytes?: number; // Default 5MB
  accept?: string;
  label?: string;
  className?: string;
  previewUrl?: string;
  onRemovePreview?: () => void;
  authEndpoint?: string;
}

export function ImageUpload({
  folder = "/uploads",
  onSuccess,
  onError,
  maxSizeBytes = 5 * 1024 * 1024, // 5MB
  accept = "image/*",
  label = "Upload Image",
  className = "",
  previewUrl,
  onRemovePreview,
  authEndpoint = "/api/imagekit/auth",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPreview, setCurrentPreview] = useState<string | null>(
    previewUrl || null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeBytes) {
      const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
      setErrorMessage(`File size exceeds maximum allowed size (${maxMB} MB).`);
      return;
    }

    setUploading(true);
    setProgress(10);
    setErrorMessage(null);

    try {
      // 1. Fetch authentication parameters from backend
      const authRes = await fetch(authEndpoint);
      if (!authRes.ok) {
        throw new Error(`Authentication endpoint returned status ${authRes.status}`);
      }
      const { token, signature, expire } = await authRes.json();

      const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error("Missing ImageKit public configuration.");
      }

      // 2. Upload file via @imagekit/next upload()
      const uploadRes = await upload({
        file,
        fileName: file.name,
        token,
        signature,
        expire,
        publicKey,
        folder,
        onUploadProgress: (evt: { loaded: number; total: number; lengthComputable?: boolean }) => {
          if (evt.lengthComputable ?? true) {
            const percent = Math.round((evt.loaded / evt.total) * 100);
            setProgress(percent);
          }
        },
      });

      setUploading(false);
      setProgress(100);

      const fileId = uploadRes.fileId ?? "";
      const url = uploadRes.url ?? "";
      const name = uploadRes.name ?? file.name;
      const filePath = uploadRes.filePath ?? "";

      const result: UploadedImageResult = {
        fileId,
        url,
        thumbnailUrl: uploadRes.thumbnailUrl || url,
        name,
        filePath,
        height: uploadRes.height,
        width: uploadRes.width,
        size: uploadRes.size,
      };

      setCurrentPreview(url || null);
      onSuccess(result);
    } catch (err: any) {
      setUploading(false);
      const msg = err?.message || "Image upload failed. Please try again.";
      setErrorMessage(msg);
      if (onError) onError(new Error(msg));
    }
  };

  const handleClear = () => {
    setCurrentPreview(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onRemovePreview) onRemovePreview();
  };

  return (
    <div className={`w-full ${className}`}>
      {currentPreview ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-900 aspect-video max-h-64 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentPreview}
            alt="Upload Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-950/80 text-slate-300 hover:text-white hover:bg-red-600 transition-all shadow-lg"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            uploading
              ? "border-purple-500 bg-purple-500/5 cursor-wait"
              : "border-slate-800 hover:border-purple-500/50 bg-slate-950/50 hover:bg-slate-900/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                {uploading ? `Uploading... ${progress}%` : label}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                SVG, PNG, JPG, WebP up to {(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB
              </p>
            </div>

            {uploading && (
              <div className="w-full max-w-xs bg-slate-800 rounded-full h-1.5 overflow-hidden mt-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="text-xs font-medium text-red-400 mt-2 flex items-center gap-1">
          <X className="w-3.5 h-3.5 inline" /> {errorMessage}
        </p>
      )}
    </div>
  );
}
