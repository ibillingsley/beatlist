import fs from "fs-extra";
import mime from "mime-types";

export default class Base64SrcLoader {
  public static Format(base64: string, mimeType: string): string {
    if (base64 == null || base64 === "") {
      return "";
    }
    return `data:${mimeType};base64,${base64}`;
  }

  public static async FromFile(filepath: string): Promise<string | undefined> {
    // const data = await fs.readFile(filepath);
    let data;
    try {
      data = await fs.readFile(filepath);
    } catch (error) {
      console.warn(error);
      return undefined;
    }
    const mimeType = mime.lookup(filepath);

    if (mimeType) {
      return this.Format(Buffer.from(data).toString("base64"), mimeType || "");
    }

    return this.FromBuffer(data, "");
  }

  public static FromBuffer(buffer: Buffer, type: string): string {
    return this.Format(
      Buffer.from(buffer).toString("base64"),
      mime.lookup(type) || ""
    );
  }

  public static ToBuffer(base64: string): Buffer {
    return Buffer.from(this.GetRawSrc(base64), "base64");
  }

  public static GetRawSrc(base64src: string): string {
    if (base64src.startsWith("base64,")) {
      return base64src.replace(/^base64,/, "");
    }
    return base64src.replace(/^(data:.*;base64,)/, "");
  }

  public static GetFileType(data: Buffer): string | undefined {
    const byteArray = Array.from(data);
    if (byteArray.length < 4) {
      return undefined;
    }
    if (
      byteArray[0] === 0xff &&
      byteArray[1] === 0xd8 &&
      byteArray[byteArray.length - 2] === 0xff &&
      byteArray[byteArray.length - 1] === 0xd9
    ) {
      return "jpeg";
    }
    if (
      byteArray[0] === 0x89 &&
      byteArray[1] === 0x50 &&
      byteArray[2] === 0x4e &&
      byteArray[3] === 0x47
    ) {
      return "png";
    }
    return undefined;
  }
}
