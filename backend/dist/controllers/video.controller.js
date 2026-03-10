import fs from "fs";
import { processVideoForHls } from "../services/video.service.js";
export const uploadVideoController = async (req, res) => {
    if (!req.file) {
        res.status(400).json({
            message: "No file uploaded",
            success: false
        });
        return;
    }
    const videoPath = req.file.path;
    const outputPath = `outpur${Date.now()}`;
    processVideoForHls(videoPath, outputPath, (error, masterPlaylist) => {
        if (error) {
            res.status(500).json({
                message: "Error processing video",
                success: false,
                error: error.message
            });
            return;
        }
        // deleting the file
        fs.unlink(videoPath, () => {
            if (error) {
                console.log("An error occured white detecting the video file", error);
            }
        });
        res.status(200).json({
            message: "Video processed successfully",
            success: true,
            data: `${masterPlaylist}`
        });
        return;
    });
    res.status(200).json({
        message: "Video uploaded successfully",
        success: true,
        videoPath
    });
};
//# sourceMappingURL=video.controller.js.map