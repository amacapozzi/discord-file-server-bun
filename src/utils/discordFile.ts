import { BunFile, gzipSync, gunzipSync } from "bun";
import { fetch } from "bun";
import { compressString, generateDownloadUrl } from "./encoderHelper";
import { addFile } from "../api/services/file.service";

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
  let chunksUrls: string[] = [];
  const totalSize = file.size;
  const totalParts = Math.ceil(totalSize / MAX_COMPRESSED_SIZE);

  const fileName = file.name ?? "file";
  const chunks = readFile(file, MAX_COMPRESSED_SIZE);
  let partNumber = 1;

  console.log(
    `Starting upload of ${fileName} (${totalSize} bytes) in ${totalParts} parts.`
  );

  let fileId: string | undefined;
  let customUrl: string | undefined;

  for await (const chunk of chunks) {
    const compressedChunk = compressData(new Uint8Array(chunk));

    const formData = new FormData();
    formData.append(
      "file",
      new Blob([compressedChunk]),
      (await compressString(fileName)) + "_" + partNumber
    );

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });

      const jsonResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          `Failed to upload part ${partNumber}: ${response.statusText}`
        );
      }

      const splittedAttachmentsUrl = jsonResponse.attachments[0].url.split("/");
      chunksUrls.push(jsonResponse.attachments[0].url);

      if (!fileId) {
        fileId = await compressString(splittedAttachmentsUrl[5]);
        customUrl = await generateDownloadUrl(
          splittedAttachmentsUrl[4],
          splittedAttachmentsUrl[5]
        );
      }

      console.log(`Part ${partNumber} uploaded successfully.`);
    } catch (error) {
      console.error(`Error uploading part ${partNumber}:`, error);
    }

    partNumber++;
  }

  if (fileId && customUrl) {
    try {
      addFile({
        fileId,
        fileName,
        chunks: chunksUrls,
        downloadUrl: customUrl,
      });

      console.log(
        `File ${fileName} uploaded successfully with ${chunksUrls.length} parts.`
      );
    } catch (error) {
      console.error(`Error finalizing upload for ${fileName}:`, error);
    }
  } else {
    console.error(
      `Failed to generate file ID or custom URL. Upload incomplete.`
    );
  }
};

export const reconstructFileFromChunks = async (
  chunksUrls: string[]
): Promise<Uint8Array> => {
  try {
    console.log(
      `Starting download and reconstruction from ${chunksUrls.length} chunks.`
    );

    const chunksData: Uint8Array[] = [];

    for (let i = 0; i < chunksUrls.length; i++) {
      const url = chunksUrls[i];
      console.log(
        `Downloading chunk ${i + 1} of ${chunksUrls.length} from ${url}`
      );

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to download chunk ${i + 1}: ${response.statusText}`
        );
      }

      const chunk = new Uint8Array(await response.arrayBuffer());
      chunksData.push(chunk);

      console.log(`Chunk ${i + 1} downloaded successfully.`);
    }

    const totalSize = chunksData.reduce((sum, chunk) => sum + chunk.length, 0);
    const compressedData = new Uint8Array(totalSize);

    let offset = 0;
    for (const chunk of chunksData) {
      compressedData.set(chunk, offset);
      offset += chunk.length;
    }

    console.log(`Decompressing the combined data...`);
    const decompressedData = gunzipSync(compressedData);

    console.log(`File reconstructed successfully.`);
    return decompressedData;
  } catch (error) {
    console.error(`Error reconstructing file:`, error);
    throw error;
  }
};
