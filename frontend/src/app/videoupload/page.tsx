"use client";

import axios from "axios";
import { ChangeEvent, useState } from "react";

export default function videoupload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log("no file selected ");
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setUploadSuccess(false);
    setPlaylistUrl(null);

    try {
      const formData = new FormData();
      formData.append("video", file);
      const response = await axios.post(
        `${apiBaseUrl}/api/v1/video/upload`,
        formData,
      );
      
      setUploadSuccess(true);
      setPlaylistUrl(response.data.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("Upload failed:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          url: `${apiBaseUrl}/api/v1/video/upload`,
        });
        setError(error.response?.data?.message || "Upload and processing failed.");
      } else {
        console.log(error);
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = ""; // Reset file input
      }
    }
  };
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e293b,_#020617_55%)] px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-4xl items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-700/60 bg-slate-900/80 p-6 shadow-2xl backdrop-blur md:p-10">
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Upload Your Video
          </h1>
          <p className="mt-2 text-sm text-slate-300 md:text-base">
            Select a file and send it to your upload API.
          </p>

          <div className="mt-8 rounded-2xl border border-dashed border-slate-500 bg-slate-950/70 p-6 md:p-8 relative">
            {isUploading && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent mb-4"></div>
                <p className="text-cyan-400 font-medium">Processing video... This may take a few minutes.</p>
              </div>
            )}
            
            <label
              htmlFor="video-upload"
              className="mb-3 block text-sm font-medium text-slate-200"
            >
              Choose video file
            </label>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              disabled={isUploading}
              onChange={handleFileUpload}
              className="block w-full cursor-pointer rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-100 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="mt-3 text-xs text-slate-400">
              Supported: MP4, MOV, WebM and other video formats.
            </p>

            {error && (
              <div className="mt-6 rounded-xl bg-red-950/50 border border-red-800/50 p-4 text-red-200 text-sm">
                <strong>Error: </strong>{error}
              </div>
            )}

            {uploadSuccess && playlistUrl && (
              <div className="mt-6 rounded-xl bg-emerald-950/50 border border-emerald-800/50 p-4 text-emerald-200 shadow-lg">
                <h3 className="font-semibold text-emerald-400 mb-2">Video Processed Successfully!</h3>
                <p className="text-sm mb-2 text-emerald-100">Master Playlist URL:</p>
                <a href={playlistUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:text-emerald-200 underline break-all text-xs font-mono transition-colors">
                  {playlistUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
