import { BunFile } from "bun";
import { readFile, uploadFileInChunks } from "../../utils/discordFile";
import { getFileSizeInMB } from "../../utils/sizeHelper";

export const uploadFile = async (filePath: string) => {
  try {
    const size = getFileSizeInMB(Bun.file(filePath));
    if (size > 25) {
      uploadFileInChunks(Bun.file(filePath));
    }
  } catch {}
};
