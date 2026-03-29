import path from "path";
import fs from "fs";
import { processVideoForHls } from "../services/video.service.js";
import { createVideo, updateVideoStatus, getAllVideos, getVideoById, } from "../repository/video.repository.js";
import { getServerBaseUrl, serializeVideo, } from "../utils/video-response.js";
const isValidObjectId = (value) => /^[a-f0-9]{24}$/i.test(value);
const cleanupFile = (filePath) => {
    fs.unlink(filePath, (unlinkError) => {
        if (unlinkError) {
            console.log("Failed to delete temporary upload", unlinkError);
        }
    });
};
export const uploadVideoController = async (req, res) => {
    console.log("uploadVideoController called");
    if (!req.file) {
        console.log("Upload request received without file field 'video'");
        res.status(400).json({
            message: "No file uploaded",
            success: false,
        });
        return;
    }
    const videoPath = req.file.path;
    const requestedTitle = req.body.title?.trim();
    const title = requestedTitle || req.file.originalname || "Untitled Video";
    const rawDescription = req.body.description;
    const description = rawDescription?.trim() ? rawDescription.trim() : undefined;
    const originalFilename = req.file.originalname;
    const outputId = Date.now().toString();
    const outputPath = path.posix.join("output", outputId);
    console.log(`Uploaded file path: ${videoPath}`);
    // Create video record in DB with PROCESSING status
    let videoRecord;
    try {
        const createData = {
            title,
            originalFilename,
            hlsPath: outputPath,
            playlistUrl: "",
        };
        if (description !== undefined) {
            createData.description = description;
        }
        videoRecord = await createVideo(createData);
        console.log(`Video record created: ${videoRecord.id}`);
    }
    catch (dbError) {
        console.log("Failed to create video record in DB", dbError);
        cleanupFile(videoPath);
        res.status(500).json({
            message: "Failed to save video metadata",
            success: false,
        });
        return;
    }
    processVideoForHls(videoPath, outputPath, async (error, masterPlaylist) => {
        if (error || !masterPlaylist) {
            console.log("Video processing failed", error?.message || "No playlist generated");
            // Update DB status to FAILED
            try {
                await updateVideoStatus(videoRecord.id, "FAILED");
            }
            catch (_e) {
                console.log("Failed to update video status to FAILED");
            }
            res.status(500).json({
                message: "Error processing video",
                success: false,
                error: error?.message || "No playlist generated",
            });
            cleanupFile(videoPath);
            return;
        }
        cleanupFile(videoPath);
        const playlistUrl = `/${masterPlaylist.replace(/\\/g, "/")}`;
        const baseUrl = getServerBaseUrl(req);
        // Update DB with COMPLETED status and playlist URL
        let updatedVideo = videoRecord;
        try {
            updatedVideo = await updateVideoStatus(videoRecord.id, "COMPLETED", playlistUrl);
        }
        catch (_e) {
            console.log("Failed to update video status to COMPLETED");
        }
        res.status(200).json({
            message: "Video processed successfully",
            success: true,
            data: serializeVideo(updatedVideo, baseUrl),
        });
        return;
    });
};
export const getVideosController = async (req, res) => {
    try {
        const videos = await getAllVideos();
        const baseUrl = getServerBaseUrl(req);
        res.status(200).json({
            message: "Videos fetched successfully",
            success: true,
            data: videos.map((video) => serializeVideo(video, baseUrl)),
        });
    }
    catch (error) {
        console.log("Failed to fetch videos", error);
        res.status(500).json({
            message: "Failed to fetch videos",
            success: false,
        });
    }
};
export const getVideoController = async (req, res) => {
    try {
        const idParam = req.params.id;
        const id = Array.isArray(idParam) ? idParam[0] : idParam;
        if (!id) {
            res.status(400).json({
                message: "Video ID is required",
                success: false,
            });
            return;
        }
        if (!isValidObjectId(id)) {
            res.status(400).json({
                message: "Video ID is invalid",
                success: false,
            });
            return;
        }
        const video = await getVideoById(id);
        if (!video) {
            res.status(404).json({
                message: "Video not found",
                success: false,
            });
            return;
        }
        res.status(200).json({
            message: "Video fetched successfully",
            success: true,
            data: serializeVideo(video, getServerBaseUrl(req)),
        });
    }
    catch (error) {
        console.log("Failed to fetch video", error);
        res.status(500).json({
            message: "Failed to fetch video",
            success: false,
        });
    }
};
//# sourceMappingURL=video.controller.js.map