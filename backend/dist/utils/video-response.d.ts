import type { Request } from "express";
import type { Video } from "@prisma/client";
export declare const getServerBaseUrl: (req: Request) => string;
export declare const toPublicAssetUrl: (baseUrl: string, assetPath?: string | null) => string;
export declare const serializeVideo: (video: Video, baseUrl: string) => {
    description: string | null;
    playlistUrl: string;
    streamPageUrl: string;
    id: string;
    title: string;
    originalFilename: string;
    hlsPath: string;
    thumbnailUrl: string | null;
    duration: number | null;
    processingStatus: string;
    createdAt: Date;
    updatedAt: Date;
};
//# sourceMappingURL=video-response.d.ts.map