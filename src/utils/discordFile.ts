import { statSync } from "fs";
import { BunFile, gzipSync } from "bun";
import { fetch } from "bun";
import { fetchRateLimit } from "./fetchHelper";
import { Encoder } from "./encoderHelper";

const WEBHOOK_URL =
  "https://discord.com/api/webhooks/1314641287290552402/Gept9U3NWzx8pLvrjHzkjfDU9cFMb70UPjfv0kX4gAQyYVVxF5cSOINFh04hEeyVh-nt";
const MAX_COMPRESSED_SIZE = 10 * 1024 * 1024;

const compressData = (data: Uint8Array): Uint8Array => {
  return gzipSync(data);
};

export async function* readFile(file: BunFile, chunkSize: number) {
  const fileSize = file.size;
  let offset = 0;

  while (offset < fileSize) {
    const blob = file.slice(offset, offset + chunkSize);

    yield await blob.arrayBuffer();
    offset += chunkSize;
  }
}

export const uploadFileInChunks = async (file: BunFile): Promise<void> => {
  const totalSize = file.size;
  const totalParts = Math.ceil(totalSize / MAX_COMPRESSED_SIZE);

  const fileName = "file";

  const chunks = readFile(file, MAX_COMPRESSED_SIZE);
  let partNumber = 1;

  console.log(
    `Starting upload of ${fileName} (${totalSize} bytes) parts (${partNumber}/${totalParts})`
  );

  for await (const chunk of chunks) {
    const compressedChunk = compressData(new Uint8Array(chunk));

    const tempFileName = `${fileName}.part${partNumber}.gz`;

    /*    const content = "mESSAGE";
     */

    const formData = new FormData();
    formData.append(
      "file",
      new Blob([compressedChunk]),
      Encoder.encodeAttachmentName(
        "1280960261892608102",
        partNumber,
        totalParts
      )
    );
    /*    formData.append(
      "payload_json",
      JSON.stringify({
        content,
      })
    ); */
    try {
      const response = await fetchRateLimit(WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });

      console.log(response.status);

      if (!response.ok) {
        throw new Error(
          `Failed to upload part ${partNumber} ${response.statusText}`
        );
      }

      console.log(`Part ${partNumber} compressed`);
    } catch (error) {
      console.error(`Error uploading part ${partNumber}:`, error);
    }

    partNumber++;
  }

  console.log(`Upload of ${fileName} completed in ${partNumber - 1} parts.`);
};
