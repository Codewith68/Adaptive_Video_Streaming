process.on('uncaughtException', (err) => { console.error('CRITICAL UNCAUGHT:', err); process.exit(1); });
process.on('unhandledRejection', (reason, promise) => { console.error('CRITICAL REJECTION:', reason); process.exit(1); });
console.log("Starting backend...");
import express from "express";
import type { Express } from "express";
import { PORT } from "./config/server.config.js";
import apiRouter from "./routes/index.js";
import cors from "cors";

const app:Express=express();
app.use(cors())
app.use((req,_res,next)=>{
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
    next()
})


app.use('/output', express.static('output'))

app.use('/api',apiRouter)

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
