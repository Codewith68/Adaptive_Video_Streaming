import express from "express";
const v1Router = express.Router();
v1Router.get("/ping", (_req, res) => {
    res.json({
        message: "Welcome to v1"
    });
});
export default v1Router;
//# sourceMappingURL=index.js.map