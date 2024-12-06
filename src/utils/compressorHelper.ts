import { writeFileSync } from "fs";
import { gunzipSync } from "bun";
import { fetch } from "bun";

const FILE_URL =
  "https://cdn.discordapp.com/attachments/1214299664518619186/1314426205600088164/essential-installer-3.0.4.exe.part1.gz?ex=6753ba4c&is=675268cc&hm=549a3434ec7a1b169cd565cfc2170841de89a36db9dd9b5d6773ca8c1ded9165&";

const decompressData = (compressedData: Uint8Array): Uint8Array => {
  try {
    return gunzipSync(compressedData);
  } catch (error) {
    throw new Error("Error decompressing data");
  }
};

export const createFileFromUint8Array = (
  filePath: string,
  byteData: Uint8Array
): void => {
  try {
    writeFileSync(filePath, byteData);
    console.log(
      `File created at ${filePath} with sizee ${byteData.length} bytes`
    );
  } catch (error) {
    throw new Error(`Error writing file`);
  }
};

export const downloadAndReconstructFile = async (
  fileName: string
): Promise<void> => {
  try {
    console.log(`Downloading file from ${FILE_URL}...`);

    const response = await fetch(FILE_URL, { method: "GET" });

    if (!response.ok) {
      throw new Error("Failed to download the file.");
    }

    const compressedData = new Uint8Array(await response.arrayBuffer());

    const decompressedData = decompressData(compressedData);

    createFileFromUint8Array(fileName, decompressedData);
  } catch (error) {
    console.error("Error", error);
  }
};
