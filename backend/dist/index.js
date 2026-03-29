import cors from "cors";
import express from "express";
import path from "path";
import { PORT } from "./config/server.config.js";
import apiRouter from "./routes/index.js";
process.on("uncaughtException", (err) => {
    console.error("CRITICAL UNCAUGHT:", err);
    process.exit(1);
});
process.on("unhandledRejection", (reason) => {
    console.error("CRITICAL REJECTION:", reason);
    process.exit(1);
});
const app = express();
const outputDirectory = path.resolve(process.cwd(), "output");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});
app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is healthy",
    });
});
app.use("/output", express.static(outputDirectory));
app.use("/api", apiRouter);
const server = app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});
export { app, server };
//# sourceMappingURL=index.js.map