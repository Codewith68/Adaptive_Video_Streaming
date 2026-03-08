import express from "express"
import type { Request, Response } from "express"

const v1Router=express.Router();

v1Router.get("/ping",(_req:Request,res:Response)=>{
    res.json({
        message:"Welcome to v1"
    })
})


export default v1Router;