import { BunFile } from "bun";

export const getFileSizeInMB = (file: BunFile): number => {
  try {
    const fileSizeInMB = file.size / (1024 * 1024);
    return Number(fileSizeInMB.toFixed(2));
  } catch (error) {
    throw new Error("Error getting the file size of the file");
  }
};
