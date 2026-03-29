"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Hls from "hls.js";
import {
  fetchVideo,
  getApiErrorMessage,
  resolveAssetUrl,
  type Video,
} from "@/lib/api";

export default function StreamPage() {
  const params = useParams<{ videoId: string }>();
  const videoId = params.videoId;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hlsError, setHlsError] = useState<string | null>(null);

  const loadVideo = useEffectEvent(async (silent = false) => {
    if (!videoId) {
      return;
    }

    try {
      const nextVideo = await fetchVideo(videoId);
      setVideo(nextVideo);
      setError(null);
    } catch (loadError) {
      if (!silent) {
        setError(
          getApiErrorMessage(loadError, "Failed to load this video entry.")
        );
      }
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    void loadVideo();
  }, [videoId]);

  useEffect(() => {
    if (video?.processingStatus !== "PROCESSING") {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadVideo(true);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [video?.processingStatus]);

  useEffect(() => {
    const element = videoRef.current;

    if (!element || video?.processingStatus !== "COMPLETED" || !video.playlistUrl) {
      return;
    }

    const playlistUrl = resolveAssetUrl(video.playlistUrl);
    setHlsError(null);

    if (element.canPlayType("application/vnd.apple.mpegurl")) {
      element.src = playlistUrl;
      return () => {
        element.pause();
        element.removeAttribute("src");
        element.load();
      };
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      hls.loadSource(playlistUrl);
      hls.attachMedia(element);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setHlsError("The HLS player could not load this stream.");
          hls.destroy();
        }
      });

      return () => hls.destroy();
    }

    setHlsError("This browser does not support HLS playback.");
  }, [video?.playlistUrl, video?.processingStatus]);

  const formattedDate = video
    ? new Date(video.createdAt).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="page-shell">
      <section className="panel section-hero stream-header">
        <div>
          <p className="section-label">Stream detail</p>
          <h1 className="section-title">
            {video?.title ?? (loading ? "Loading video..." : "Video detail")}
          </h1>
          <p className="section-copy">
            {video?.description ??
              "Review the current processing state and play the stream when it is ready."}
          </p>
        </div>
        <div className="actions-row">
          <Link href="/" className="button-secondary">
            Back to library
          </Link>
          <Link href="/upload" className="button-primary">
            Upload another
          </Link>
        </div>
      </section>

      {loading ? (
        <div className="loading-shell">
          <div className="panel loading-card">
            <div className="spinner" />
            <p>Loading video metadata...</p>
          </div>
        </div>
      ) : error ? (
        <div className="panel empty-state">
          <h2 className="section-title">Unable to load this video</h2>
          <p className="section-copy">{error}</p>
        </div>
      ) : (
        <>
          <section className="player-frame panel">
            {video?.processingStatus === "COMPLETED" ? (
              hlsError ? (
                <div className="player-placeholder">
                  <div className="player-state">Playback error</div>
                  <p>{hlsError}</p>
                </div>
              ) : (
                <video ref={videoRef} controls playsInline className="player-element" />
              )
            ) : video?.processingStatus === "FAILED" ? (
              <div className="player-placeholder">
                <div className="player-state">Processing failed</div>
                <p>
                  This upload did not finish successfully. Re-upload it from the
                  upload page to generate a fresh HLS output.
                </p>
              </div>
            ) : (
              <div className="player-placeholder">
                <div className="spinner" />
                <div className="player-state">Still processing</div>
                <p>
                  The page refreshes automatically while the backend finishes the
                  adaptive renditions.
                </p>
              </div>
            )}
          </section>

          <section className="player-meta-grid">
            <div className="panel detail-panel">
              <div className="section-head">
                <div>
                  <p className="section-label">Overview</p>
                  <h2 className="section-title">Video information</h2>
                </div>
              </div>
              <div className="detail-stack">
                <div className="detail-row">
                  <span>Status</span>
                  <strong>{video?.processingStatus}</strong>
                </div>
                <div className="detail-row">
                  <span>Uploaded</span>
                  <strong>{formattedDate ?? "Unknown"}</strong>
                </div>
                <div className="detail-row">
                  <span>Original file</span>
                  <strong>{video?.originalFilename}</strong>
                </div>
                <div className="detail-row">
                  <span>Video ID</span>
                  <strong className="inline-code">{video?.id}</strong>
                </div>
              </div>
            </div>

            <div className="panel detail-panel">
              <div className="section-head">
                <div>
                  <p className="section-label">Stream source</p>
                  <h2 className="section-title">Playback notes</h2>
                </div>
              </div>
              <div className="notice info">
                <h3>HLS playlist</h3>
                <p>
                  {video?.playlistUrl
                    ? resolveAssetUrl(video.playlistUrl)
                    : "Playlist path will appear after processing completes."}
                </p>
              </div>
              {video?.processingStatus === "PROCESSING" ? (
                <div className="notice warning">
                  <h3>Auto refresh is on</h3>
                  <p>The page checks the backend every 5 seconds until the stream is ready.</p>
                </div>
              ) : null}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
