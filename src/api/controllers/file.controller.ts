import { BunFile } from "bun";
import {
  readFile,
  uploadFileInChunks,
  uploadFileToDiscord,
} from "../../utils/discordFile";
import { getFileSizeInMB } from "../../utils/sizeHelper";

export const uploadFile = async (filePath: string) => {
  try {
    const size = getFileSizeInMB(Bun.file(filePath));
    if (size > 25) {
      uploadFileInChunks(Bun.file(filePath));
    }
    uploadFileToDiscord(Bun.file(filePath));
  } catch {}
};
