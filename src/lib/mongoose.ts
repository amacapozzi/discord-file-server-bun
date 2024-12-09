import mongoose from "mongoose";

export const createMongooseConnection = async () => {
  try {
    await mongoose.connect(Bun.env.MONGOOSE_URL ?? "");
    console.log("Connected to database");
  } catch {
    throw new Error("Failed to connect mongoose");
  }
};
