import type { Request } from "express";
import type { Video } from "@prisma/client";

const isAbsoluteUrl = (value: string) => /^[a-z][a-z0-9+.-]*:\/\//i.test(value);

export const getServerBaseUrl = (req: Request): string => {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol =
    typeof forwardedProto === "string" && forwardedProto.length > 0
      ? forwardedProto.split(",")[0]?.trim() || req.protocol
      : req.protocol;

  return `${protocol}://${req.get("host") ?? `localhost:${process.env.PORT ?? 8000}`}`;
};

export const toPublicAssetUrl = (
  baseUrl: string,
  assetPath?: string | null
): string => {
  if (!assetPath) {
    return "";
  }

  if (isAbsoluteUrl(assetPath)) {
    return assetPath;
  }

  const normalizedPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  return `${baseUrl}${normalizedPath}`;
};

export const serializeVideo = (video: Video, baseUrl: string) => ({
  ...video,
  description: video.description ?? null,
  playlistUrl: toPublicAssetUrl(baseUrl, video.playlistUrl),
  streamPageUrl: `/stream/${video.id}`,
});
