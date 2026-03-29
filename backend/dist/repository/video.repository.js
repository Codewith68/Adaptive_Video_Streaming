import prisma from "../config/prisma.js";
export const createVideo = async (data) => {
    const createData = {
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
export const updateVideoStatus = async (videoId, status, playlistUrl) => {
    const data = {
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
export const getVideoById = async (videoId) => {
    const video = await prisma.video.findUnique({
        where: { id: videoId },
    });
    return video;
};
//# sourceMappingURL=video.repository.js.map