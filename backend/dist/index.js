import express from "express";
import { PORT } from "./config/server.config.js";
import apiRouter from "./routes/index.js";
const app = express();
app.use('/api', apiRouter);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map