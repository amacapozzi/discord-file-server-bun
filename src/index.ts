import { Hono } from "hono";
import { uploadFile } from "./api/controllers/file.controller";
import { createMongooseConnection } from "./lib/mongoose";
import { fileRouter } from "./api/routes/file.router";
import { uploadFileInChunks } from "./utils/discordFile";

const app = new Hono();

app.route("/file", fileRouter);

uploadFileInChunks(Bun.file("C:\\Users\\Student\\Downloads\\config.exe"));

createMongooseConnection();

export default app;
