import express from "express";
import videoRouter from "./video.routes.js";
const v1Router = express.Router();
v1Router.use("/video", videoRouter);
v1Router.get("/ping", (_req, res) => {
    res.json({
        message: "Welcome to v1 bro"
    });
});
export default v1Router;
//# sourceMappingURL=index.js.map