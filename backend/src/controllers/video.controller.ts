import type { Request, Response } from "express";
import  fs  from "fs";
import { processVideoForHls } from "../services/video.service.js";



export const uploadVideoController=async(req:Request,res:Response)=>{
        console.log("uploadVideoController called")
        if(!req.file){
             console.log("Upload request received without file field 'video'")
             res.status(400).json({
                message:"No file uploaded",
                success:false
            })
            return
        }

        const videoPath=req.file.path;
        console.log(`Uploaded file path: ${videoPath}`)
        const outputPath=`output/${Date.now()}`
        processVideoForHls(videoPath,outputPath,(error,masterPlaylist)=>{
            if(error || !masterPlaylist){
                console.log("Video processing failed",error?.message || "No playlist generated")
                res.status(500).json({
                    message:"Error processing video",
                    success:false,
                    error:error?.message || "No playlist generated"
                })
                // Clean up the uploaded file even on failure
                fs.unlink(videoPath, (unlinkError) => {
                    if (unlinkError) {
                        console.log("An error occurred while deleting the video file after processing failure", unlinkError);
                    }
                });
                return
            }
            // deleting the file
            fs.unlink(videoPath,(unlinkError)=>{ // Changed 'error' to 'unlinkError' to avoid conflict with processing error
                if(unlinkError){
                    console.log("An error occured while deleting the video file",unlinkError)
                }
            })
            const baseUrl = `http://localhost:${process.env.PORT || 3000}`;
            const playlistUrl = `${baseUrl}/${masterPlaylist.replace(/\\/g, '/')}`;
            res.status(200).json({
                message:"Video processed successfully",
                success:true,
                data: playlistUrl
            })
            return
        })
}   
