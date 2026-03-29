"use client";

import { useDeferredValue, useEffect, useEffectEvent, useState } from "react";
import Link from "next/link";
import { VideoCard } from "./components/VideoCard";
import { fetchVideos, getApiErrorMessage, type Video } from "@/lib/api";

const FILTERS = ["ALL", "COMPLETED", "PROCESSING", "FAILED"] as const;
type FilterValue = (typeof FILTERS)[number];

function SkeletonCard() {
  return (
    <div className="panel skeleton-card">
      <div className="skeleton skeleton-media" />
      <div className="skeleton-stack">
        <div className="skeleton skeleton-line wide" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line short" />
      </div>
    </div>
  );
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterValue>("ALL");
  const deferredQuery = useDeferredValue(searchQuery.trim().toLowerCase());

  const loadVideos = useEffectEvent(async (silent = false) => {
    try {
      const nextVideos = await fetchVideos();
      setVideos(nextVideos);
      setError(null);
    } catch (loadError) {
      if (!silent) {
        setError(
          getApiErrorMessage(
            loadError,
            "Failed to load videos. Make sure the backend server is running."
          )
        );
      }
    } finally {
      setLoading(false);
    }
  });

  const handleRefresh = async () => {
    setLoading(true);

    try {
      const nextVideos = await fetchVideos();
      setVideos(nextVideos);
      setError(null);
    } catch (loadError) {
      setError(
        getApiErrorMessage(
          loadError,
          "Failed to load videos. Make sure the backend server is running."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadVideos();
  }, []);

  useEffect(() => {
    const hasProcessingItems = videos.some(
      (video) => video.processingStatus === "PROCESSING"
    );

    if (!hasProcessingItems) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadVideos(true);
    }, 7000);

    return () => window.clearInterval(intervalId);
  }, [videos]);

  const completedCount = videos.filter(
    (video) => video.processingStatus === "COMPLETED"
  ).length;
  const processingCount = videos.filter(
    (video) => video.processingStatus === "PROCESSING"
  ).length;
  const failedCount = videos.filter(
    (video) => video.processingStatus === "FAILED"
  ).length;

  const visibleVideos = videos.filter((video) => {
    const matchesFilter =
      activeFilter === "ALL" || video.processingStatus === activeFilter;
    const matchesQuery =
      deferredQuery.length === 0 ||
      video.title.toLowerCase().includes(deferredQuery) ||
      video.originalFilename.toLowerCase().includes(deferredQuery) ||
      (video.description ?? "").toLowerCase().includes(deferredQuery);

    return matchesFilter && matchesQuery;
  });

  return (
    <div className="page-shell">
      <section className="hero-grid">
        <div className="panel hero-copy">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Adaptive HLS on MongoDB
          </span>
          <h1 className="hero-title">
            Your uploads, <span>organized and streamable</span> from one home.
          </h1>
          <p className="hero-text">
            Store metadata in MongoDB with Prisma, keep transcoded playlists on
            disk, and give users a library page that shows every upload, every
            status, and a direct path into playback.
          </p>
          <div className="hero-actions">
            <Link href="/upload" className="button-primary">
              Upload a video
            </Link>
            <Link href="#library" className="button-secondary">
              Browse library
            </Link>
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-label">Total videos</span>
              <span className="stat-value">{videos.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Ready now</span>
              <span className="stat-value">{completedCount}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Still processing</span>
              <span className="stat-value">{processingCount}</span>
            </div>
          </div>
        </div>

        <aside className="panel hero-side">
          <div className="section-head">
            <div>
              <p className="section-label">Library snapshot</p>
              <h2 className="section-title">Recent activity</h2>
            </div>
          </div>
          <div className="recent-list">
            {videos.slice(0, 3).map((video) => (
              <Link key={video.id} href={video.streamPageUrl} className="recent-item">
                <div>
                  <strong>{video.title}</strong>
                  <span>{video.processingStatus}</span>
                </div>
                <span className="inline-code">{video.id.slice(-6)}</span>
              </Link>
            ))}
            {videos.length === 0 ? (
              <div className="recent-item muted">
                <div>
                  <strong>No uploads yet</strong>
                  <span>Your first video will show up here.</span>
                </div>
              </div>
            ) : null}
          </div>
          <div className="notice info">
            <h3>Database-backed status</h3>
            <p>
              Failed uploads stay visible too, so you can inspect or retry
              instead of losing track of them.
            </p>
          </div>
          {failedCount > 0 ? (
            <div className="notice warning">
              <h3>{failedCount} upload{failedCount > 1 ? "s" : ""} need attention</h3>
              <p>Open a failed item to review the status and re-upload if needed.</p>
            </div>
          ) : null}
        </aside>
      </section>

      <section id="library" className="library-section">
        <div className="toolbar">
          <div>
            <p className="section-label">Video library</p>
            <h2 className="section-title">Browse every uploaded asset</h2>
          </div>
          <div className="actions-row">
            <button className="button-secondary" onClick={() => void handleRefresh()}>
              Refresh library
            </button>
          </div>
        </div>

        <div className="panel library-tools">
          <div className="search-shell">
            <label className="field-label" htmlFor="video-search">
              Search
            </label>
            <input
              id="video-search"
              className="input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search title, description, or file name"
            />
          </div>

          <div className="filter-shell">
            <span className="field-label">Status</span>
            <div className="segmented">
              {FILTERS.map((filterValue) => (
                <button
                  key={filterValue}
                  className={`filter-pill ${
                    activeFilter === filterValue ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter(filterValue)}
                >
                  {filterValue === "ALL" ? "All" : filterValue}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error ? <div className="notice error">{error}</div> : null}

        {loading ? (
          <div className="video-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : visibleVideos.length === 0 && !error ? (
          <div className="panel empty-state">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Nothing here yet
            </span>
            <h3 className="section-title">Start the library with your first upload.</h3>
            <p className="section-copy">
              The home page doubles as a media dashboard, so new uploads appear
              here as soon as processing begins.
            </p>
            <div className="actions-row center">
              <Link href="/upload" className="button-primary">
                Go to upload
              </Link>
            </div>
          </div>
        ) : (
          <div className="video-grid">
            {visibleVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
