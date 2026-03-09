export const uploadVideoController = async (req, res) => {
    if (!req.file) {
        res.status(400).json({
            message: "No file uploaded",
            success: false
        });
        return;
    }
    const videoPath = req.file.path;
    res.status(200).json({
        message: "Video uploaded successfully",
        success: true,
        videoPath
    });
};
//# sourceMappingURL=video.controller.js.map