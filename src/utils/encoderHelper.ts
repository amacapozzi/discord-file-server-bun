export class Encoder {
  public static encodeAttachmentName(
    channelId: string,
    index: number,
    amount: number
  ): string {
    const xorValue = Encoder.xorBigInts(
      Encoder.stringToBigInt(channelId),
      BigInt(index),
      BigInt(amount)
    );

    const base64Url = Encoder.toBase64Url(Encoder.bigIntToBytes(xorValue));
    return base64Url.replace(/^_+/, "") + "_" + (amount - index);
  }

  private static stringToBigInt(value: string): bigint {
    let result = BigInt(0);
    for (let i = 0; i < value.length; i++) {
      result = (result << BigInt(8)) | BigInt(value.charCodeAt(i));
    }
    return result;
  }

  private static xorBigInts(...values: bigint[]): bigint {
    return values.reduce((acc, value) => acc ^ value, BigInt(0));
  }

  private static bigIntToBytes(value: bigint): number[] {
    const bytes: number[] = [];
    while (value > BigInt(0)) {
      bytes.push(Number(value & BigInt(0xff)));
      value >>= BigInt(8);
    }
    return bytes.reverse();
  }

  private static toBase64Url(bytes: number[]): string {
    let binaryString = "";
    for (const byte of bytes) {
      binaryString += String.fromCharCode(byte);
    }

    return btoa(binaryString)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
}

