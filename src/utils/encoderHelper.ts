import { brotliCompress, brotliDecompress } from "zlib";

export async function generateDownloadUrl(
  messageId: string,
  channelId: string
): Promise<string> {
  const compressedMessageId = await compressString(messageId);
  const compressedChannelId = await compressString(channelId);
  const combined = `${compressedMessageId}_${compressedChannelId}`;
  return encodeURIComponent(combined);
}

export async function decodeDownloadUrl(
  compressedData: string
): Promise<{ messageId: string; channelId: string }> {
  const [compressedMessageId, compressedChannelId] = compressedData.split("_");
  const messageId = await decompressString(compressedMessageId);
  const channelId = await decompressString(compressedChannelId);
  return { messageId, channelId };
}
export function compressString(input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    brotliCompress(input, (err, buffer) => {
      if (err) reject(err);
      else
        resolve(
          buffer
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "")
        );
    });
  });
}
export function decompressString(input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const buffer = Buffer.from(
      input.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    );

    const unit8Buffer = new Uint8Array(buffer);

    brotliDecompress(unit8Buffer, (err, result) => {
      if (err) reject(err);
      else resolve(result.toString("utf-8"));
    });
  });
}
