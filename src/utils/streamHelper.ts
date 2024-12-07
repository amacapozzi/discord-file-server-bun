import { createHash } from "crypto";

export class TransformStream {
  private transformationKey: Uint8Array;
  private position: number = 0;

  constructor(
    private baseStream: WritableStream | ReadableStream,
    subKey?: Uint8Array
  ) {
    const key = "discord-recover-key";
    const transformationKey = new TextEncoder().encode(key);
    this.transformationKey = transformationKey;

    if (subKey) {
      const derivedKey = TransformStream.hkdfExpand(subKey, 4080);
      this.applyTransformationKey(derivedKey);
    }
  }

  async read(
    buffer: Uint8Array,
    offset: number,
    count: number
  ): Promise<number> {
    if (!(this.baseStream instanceof ReadableStream)) {
      throw new Error("Stream no es de lectura.");
    }

    const reader = this.baseStream.getReader();
    const { value, done } = await reader.read();
    if (done || !value) return 0;

    const bytesRead = value.subarray(offset, offset + count).length;
    buffer.set(value.subarray(offset, offset + count), offset);

    this.transform(buffer, this.position);
    this.position += bytesRead;

    return bytesRead;
  }

  async write(
    buffer: Uint8Array,
    offset: number,
    count: number
  ): Promise<void> {
    if (!(this.baseStream instanceof WritableStream)) {
      throw new Error("Stream no es de escritura.");
    }

    const transformedBuffer = buffer.slice(offset, offset + count);
    this.transform(transformedBuffer, this.position);
    this.position += count;

    const writer = this.baseStream.getWriter();
    await writer.write(transformedBuffer);
    writer.releaseLock();
  }

  private transform(data: Uint8Array, position: number): void {
    for (let i = 0; i < data.length; i++) {
      const relativeIndex = position + i;
      const keyIndex = relativeIndex % this.transformationKey.length;
      data[i] ^= this.transformationKey[keyIndex];
    }
  }

  private applyTransformationKey(derivedKey: Uint8Array): void {
    for (let i = 0; i < this.transformationKey.length; i++) {
      this.transformationKey[i] ^= derivedKey[i % derivedKey.length];
    }
  }

  private static hkdfExpand(subKey: Uint8Array, length: number): Uint8Array {
    const hash = createHash("md5");
    hash.update(subKey);
    const expandedKey = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      expandedKey[i] = hash.digest()[i % 16];
    }
    return expandedKey;
  }
}
