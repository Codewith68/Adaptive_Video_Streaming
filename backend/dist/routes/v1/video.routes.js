import express from 'express';
import { uploadVideoController, getVideosController, getVideoController } from '../../controllers/video.controller.js';
import upload from '../../middlewares/multer.middleware.js';
const videoRouter = express.Router();
videoRouter.get("/", getVideosController);
videoRouter.get("/:id", getVideoController);
videoRouter.post("/upload", upload.single("video"), uploadVideoController);
export default videoRouter;
//# sourceMappingURL=video.routes.js.map