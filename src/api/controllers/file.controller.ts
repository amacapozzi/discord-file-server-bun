import { Context } from "hono";
import {
  uploadFileInChunks,
  reconstructFileFromChunks,
} from "../../utils/discordFile";
import { getFile } from "../services/file.service";

export const uploadFile = async () => {
  try {
    uploadFileInChunks(Bun.file("essential-installer-3.0.4.exe"));
  } catch {}
};

export const downloadFile = async (c: Context) => {
  try {
    const fileId = c.req.param("fileId");

    const file = await getFile(fileId);

    const fileBytes = await reconstructFileFromChunks(file.chunks);
    c.header("Content-Type", "application/octet-stream");
    c.header("Content-Disposition", `attachment; filename="${file.fileName}"`);
    return c.body(fileBytes as any);
  } catch (err) {
    if (err instanceof Error) {
      return c.json({ message: err.message }, 400);
    }
    return c.json({ message: "Internal server error" }, 500);
  }
};
