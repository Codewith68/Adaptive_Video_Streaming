import express from 'express'
import { uploadVideoController } from '../../controllers/video.controller.js'
import upload from '../../middlewares/multer.middleware.js'


const videoRouter = express.Router()

videoRouter.post("/upload", upload.single("video"), uploadVideoController)
export default videoRouter