import prisma from "../config/prisma.js";

export const createVideo = async (data: {
    title: string;
    description?: string;
    originalFilename: string;
    hlsPath: string;
    playlistUrl: string;
}) => {
    const createData: {
        title: string;
        description?: string | null;
        originalFilename: string;
        hlsPath: string;
        playlistUrl: string;
        processingStatus: string;
    } = {
        title: data.title,
        originalFilename: data.originalFilename,
        hlsPath: data.hlsPath,
        playlistUrl: data.playlistUrl,
        processingStatus: "PROCESSING",
    };

    if (data.description !== undefined) {
        createData.description = data.description;
    }

    const video = await prisma.video.create({
        data: createData,
    });
    return video;
};

export const updateVideoStatus = async (
    videoId: string,
    status: string,
    playlistUrl?: string
) => {
    const data: { processingStatus: string; playlistUrl?: string } = {
        processingStatus: status,
    };
    if (playlistUrl !== undefined) {
        data.playlistUrl = playlistUrl;
    }
    const video = await prisma.video.update({
        where: { id: videoId },
        data,
    });
    return video;
};

export const getAllVideos = async () => {
    const videos = await prisma.video.findMany({
        orderBy: { createdAt: "desc" },
    });
    return videos;
};

export const getVideoById = async (videoId: string) => {
    const video = await prisma.video.findUnique({
        where: { id: videoId },
    });
    return video;
};
