import { Hono } from "hono";
import { uploadFile } from "./api/controllers/file.controller";

const app = new Hono();

app.get("/", (c) => {
  uploadFile("Frame42.png");
  return c.text("Hello Hono!");
});

//uploadFile("config.exe");
//downloadAndReconstructFile("recover.exe");
//uploadCompressedFile("essential-installer-3.0.4.exe");

export default app;
