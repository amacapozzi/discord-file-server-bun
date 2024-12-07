import { BunFile } from "bun";
import { uploadFileInChunks } from "../../utils/discordFile";
import { getFileSizeInMB } from "../../utils/sizeHelper";

export const uploadFile = async (filePath: string) => {
  try {
    const size = getFileSizeInMB(Bun.file(filePath));
    uploadFileInChunks(Bun.file(filePath));
  } catch {}
};
