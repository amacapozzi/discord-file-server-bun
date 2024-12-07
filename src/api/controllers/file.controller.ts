import { uploadFileInChunks } from "../../utils/discordFile";

export const uploadFile = async (filePath: string) => {
  try {
    uploadFileInChunks(Bun.file(filePath));
  } catch {}
};
