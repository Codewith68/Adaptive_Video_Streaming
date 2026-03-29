"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import type { Video } from "@/lib/api";

const STATUS_STYLES: Record<
  string,
  { label: string; accent: string; surface: string; note: string }
> = {
  COMPLETED: {
    label: "Ready to stream",
    accent: "#2dd4bf",
    surface: "rgba(45, 212, 191, 0.18)",
    note: "Master playlist created and ready in the player.",
  },
  PROCESSING: {
    label: "Transcoding now",
    accent: "#f59e0b",
    surface: "rgba(245, 158, 11, 0.2)",
    note: "Adaptive renditions are still being generated.",
  },
  FAILED: {
    label: "Needs attention",
    accent: "#fb7185",
    surface: "rgba(251, 113, 133, 0.18)",
    note: "Something broke during processing for this upload.",
  },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export function VideoCard({ video }: { video: Video }) {
  const style = STATUS_STYLES[video.processingStatus] ?? STATUS_STYLES.PROCESSING;
  const extension = video.originalFilename.split(".").pop()?.toUpperCase() ?? "VIDEO";
  const summary =
    video.description?.trim() ||
    (video.processingStatus === "COMPLETED"
      ? "Open the player to watch the adaptive HLS stream."
      : style.note);

  return (
    <Link
      href={video.streamPageUrl}
      className="panel video-card"
      style={
        {
          "--card-accent": style.accent,
          "--card-surface": style.surface,
        } as CSSProperties
      }
    >
      <div className="video-card-media">
        <div className="video-card-pattern" />
        <div className="video-card-topline">
          <span className="status-dot" />
          <span>{style.label}</span>
        </div>
        <div className="video-card-extension">{extension}</div>
        <div>
          <p className="video-card-kicker">{video.processingStatus}</p>
          <h3 className="video-card-title">{video.title}</h3>
        </div>
      </div>
      <div className="video-card-body">
        <p className="video-card-summary">{summary}</p>
        <div className="video-meta-row">
          <span>{formatDate(video.createdAt)}</span>
          <span className="inline-code">{video.id.slice(-6)}</span>
        </div>
        <div className="video-card-action">
          <span>Open details</span>
          <span className="video-card-arrow">+</span>
        </div>
      </div>
    </Link>
  );
}
