import * as mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    downloadUrl: { type: String, required: true, unique: true },
    fileId: { type: String, required: true, unique: true },
    chunks: [{ type: String }],
  },
  { versionKey: false, timestamps: true }
);

export type File = mongoose.InferSchemaType<typeof fileSchema>;
export const FileModel = mongoose.model("files", fileSchema);
