import { Hono } from "hono";
import { uploadFile } from "./api/controllers/file.controller";
import { downloadAndReconstructFile } from "./utils/compressorHelper";
import { readFile, uploadFileInChunks } from "./utils/discordFile";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

//uploadFile("config.exe");
//downloadAndReconstructFile("recover.exe");
uploadFileInChunks(Bun.file("essential-installer-3.0.4.exe"));
//uploadCompressedFile("essential-installer-3.0.4.exe");

export default app;
