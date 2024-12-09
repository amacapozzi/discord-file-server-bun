import { FileModel, type File } from "../../models/fileSchema";

export const addFile = async (
  fileData: Omit<File, "createdAt" | "updatedAt">
): Promise<string> => {
  const file = new FileModel({
    downloadUrl: fileData.downloadUrl,
    fileId: fileData.fileId,
    chunks: fileData.chunks,
    fileName: fileData.fileName,
  });

  await file.save();
  return "File saved succesfully";
};

export const getFile = async (fileId: string): Promise<Error | any> => {
  const file = await FileModel.findOne({ fileId: fileId });
  if (!file) {
    throw new Error("File not found.");
  }
  return file;
};
