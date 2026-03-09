import express from "express"
import type { Request, Response } from "express"
import videoRouter from "./video.routes.js"

const v1Router=express.Router();


v1Router.use("/video",videoRouter)


v1Router.get("/ping",(_req:Request,res:Response)=>{
    res.json({
        message:"Welcome to v1 bro"
    })
})


export default v1Router;