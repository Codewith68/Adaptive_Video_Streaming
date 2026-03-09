import express from "express";
import type { Express } from "express";
import { PORT } from "./config/server.config.js";
import apiRouter from "./routes/index.js";
import cors from "cors";

const app:Express=express();
app.use(cors())



app.use('/api',apiRouter)

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})  