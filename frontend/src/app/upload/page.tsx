"use client";

import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  startTransition,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Video } from "@/lib/api";
import { getApiErrorMessage, uploadVideo } from "@/lib/api";

const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const getDefaultTitle = (fileName: string) => fileName.replace(/\.[^.]+$/, "");

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<Video | null>(null);

  const assignFile = (file: File) => {
    setSelectedFile(file);
    setUploadedVideo(null);
    setError(null);
    if (!title.trim()) {
      setTitle(getDefaultTitle(file.name));
    }
  };

  const handleBrowse = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    assignFile(file);
    event.target.value = "";
  };

  const handleDragState = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
      return;
    }

    setDragActive(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      assignFile(file);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Choose a video file before starting the upload.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("video", selectedFile);
    formData.append("title", title.trim() || getDefaultTitle(selectedFile.name));
    if (description.trim()) {
      formData.append("description", description.trim());
    }

    try {
      const video = await uploadVideo(formData);
      setUploadedVideo(video);
    } catch (uploadError) {
      setError(
        getApiErrorMessage(uploadError, "Upload failed. Check the backend logs.")
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="page-shell">
      <section className="panel section-hero upload-intro">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Upload to StreamVault
          </span>
          <h1 className="section-title">
            Turn one upload into a streaming-ready library entry.
          </h1>
          <p className="section-copy">
            Add metadata first, drop in a video, and let the backend create
            adaptive HLS output that shows up on the home page right away.
          </p>
        </div>
        <div className="actions-row">
          <Link href="/" className="button-secondary">
            Back to library
          </Link>
        </div>
      </section>

      <section className="upload-layout">
        <form className="panel upload-panel" onSubmit={handleSubmit}>
          <div className="section-head">
            <div>
              <p className="section-label">Video metadata</p>
              <h2 className="section-title">Prepare the upload</h2>
            </div>
          </div>

          <div className="form-stack">
            <label className="form-field">
              <span className="field-label">Title</span>
              <input
                className="input"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Launch recap, trailer cut, product demo..."
                disabled={isUploading}
              />
            </label>

            <label className="form-field">
              <span className="field-label">Description</span>
              <textarea
                className="input textarea"
                rows={5}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add context for the library and player page."
                disabled={isUploading}
              />
            </label>

            <div
              className={[
                "dropzone",
                dragActive ? "drag-active" : "",
                isUploading ? "is-busy" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onDragEnter={handleDragState}
              onDragOver={handleDragState}
              onDragLeave={handleDragState}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                hidden
                onChange={handleBrowse}
                disabled={isUploading}
              />
              <div className="dropzone-icon">VID</div>
              <h3 className="dropzone-title">
                {selectedFile ? selectedFile.name : "Drop a video here or browse"}
              </h3>
              <p className="dropzone-copy">
                MP4, MOV, MKV, WebM, and most FFmpeg-friendly formats work.
              </p>
              {selectedFile ? (
                <div className="file-pill">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <span>{selectedFile.type || "video/*"}</span>
                </div>
              ) : null}
            </div>

            {error ? <div className="notice error">{error}</div> : null}

            {uploadedVideo ? (
              <div className="notice success">
                <h3>Processing finished</h3>
                <p>
                  <strong>{uploadedVideo.title}</strong> is now in the library and
                  ready to open in the player.
                </p>
                <div className="actions-row">
                  <button
                    className="button-primary"
                    type="button"
                    onClick={() =>
                      startTransition(() => {
                        router.push(uploadedVideo.streamPageUrl);
                      })
                    }
                  >
                    Open player
                  </button>
                  <button
                    className="button-secondary"
                    type="button"
                    onClick={() =>
                      startTransition(() => {
                        router.push("/");
                      })
                    }
                  >
                    Return to library
                  </button>
                </div>
              </div>
            ) : null}

            <div className="actions-row">
              <button
                className="button-primary"
                type="submit"
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? "Uploading and processing..." : "Upload and process"}
              </button>
              <button
                className="button-secondary"
                type="button"
                disabled={isUploading}
                onClick={() => {
                  setSelectedFile(null);
                  setUploadedVideo(null);
                  setError(null);
                }}
              >
                Clear file
              </button>
            </div>
          </div>
        </form>

        <div className="helper-grid">
          <div className="panel helper-card">
            <p className="section-label">Pipeline</p>
            <h2 className="section-title">What happens after upload</h2>
            <div className="helper-list">
              <div className="helper-item">
                <strong>1. Metadata is stored</strong>
                <span>MongoDB keeps the title, file source, status, and stream path.</span>
              </div>
              <div className="helper-item">
                <strong>2. FFmpeg creates renditions</strong>
                <span>The backend writes HLS playlists and transport stream segments.</span>
              </div>
              <div className="helper-item">
                <strong>3. Library updates automatically</strong>
                <span>The home page shows completed and in-progress uploads in one place.</span>
              </div>
            </div>
          </div>

          <div className="panel helper-card">
            <p className="section-label">Output ladder</p>
            <h2 className="section-title">Adaptive playback targets</h2>
            <div className="helper-list compact">
              <div className="helper-item">
                <strong>1080p</strong>
                <span>High detail on desktops and large displays.</span>
              </div>
              <div className="helper-item">
                <strong>720p / 480p</strong>
                <span>Balanced quality for standard broadband.</span>
              </div>
              <div className="helper-item">
                <strong>360p / 240p / 180p</strong>
                <span>Lower bitrates for weaker mobile connections.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
