"use client";

import axios from "axios";
import { ChangeEvent } from "react";

export default function videoupload() {
  const handelFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log("no file selected ");
      return;
    }
    console.log(file);
    try {
      const formData = new FormData();
      formData.append("video", file);
      const response = await axios.post(
        "http://localhost:3000/api/v1/video/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      console.log(response.data);
    } catch (error) {
      console.log(error);
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

          <div className="mt-8 rounded-2xl border border-dashed border-slate-500 bg-slate-950/70 p-6 md:p-8">
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
              onChange={handelFileUpload}
              className="block w-full cursor-pointer rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-100 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <p className="mt-3 text-xs text-slate-400">
              Supported: MP4, MOV, WebM and other video formats.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
