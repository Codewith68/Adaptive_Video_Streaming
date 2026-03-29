export declare const createVideo: (data: {
    title: string;
    description?: string;
    originalFilename: string;
    hlsPath: string;
    playlistUrl: string;
}) => Promise<{
    id: string;
    title: string;
    description: string | null;
    originalFilename: string;
    hlsPath: string;
    playlistUrl: string;
    thumbnailUrl: string | null;
    duration: number | null;
    processingStatus: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const updateVideoStatus: (videoId: string, status: string, playlistUrl?: string) => Promise<{
    id: string;
    title: string;
    description: string | null;
    originalFilename: string;
    hlsPath: string;
    playlistUrl: string;
    thumbnailUrl: string | null;
    duration: number | null;
    processingStatus: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const getAllVideos: () => Promise<{
    id: string;
    title: string;
    description: string | null;
    originalFilename: string;
    hlsPath: string;
    playlistUrl: string;
    thumbnailUrl: string | null;
    duration: number | null;
    processingStatus: string;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare const getVideoById: (videoId: string) => Promise<{
    id: string;
    title: string;
    description: string | null;
    originalFilename: string;
    hlsPath: string;
    playlistUrl: string;
    thumbnailUrl: string | null;
    duration: number | null;
    processingStatus: string;
    createdAt: Date;
    updatedAt: Date;
} | null>;
//# sourceMappingURL=video.repository.d.ts.map