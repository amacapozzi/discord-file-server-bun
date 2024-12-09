import { Hono } from "hono";
import { downloadFile, uploadFile } from "../controllers/file.controller";

export const fileRouter = new Hono();

fileRouter.get("/:fileId", downloadFile);
fileRouter.post("/upload", uploadFile);
