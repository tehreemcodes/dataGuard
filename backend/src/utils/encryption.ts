import crypto from "crypto";
import fs from "fs";
import path from "path";

const algorithm = "aes-256-cbc";
const KEY = Buffer.from(process.env.FILE_KEY!, "hex"); // 32 bytes
if (KEY.length !== 32) {
  console.warn("WARNING: FILE_KEY must be 32 bytes (hex); generated key length:", KEY.length);
}
const IV_LENGTH = 16;

export const encryptFile = (inputPath: string, outputPath: string) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(algorithm, KEY, iv);

  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  // write iv prefix so we can decode later
  output.write(iv);

  return new Promise<void>((resolve, reject) => {
    input.pipe(cipher).pipe(output).on("finish", () => resolve()).on("error", reject);
  });
};

export const decryptToTemp = (encryptedPath: string) => {
  const tmpName = `tmp-${Date.now()}-${path.basename(encryptedPath).replace(/^enc-/, "")}`;
  const tmpPath = path.join("uploads", tmpName);
  return new Promise<string>((resolve, reject) => {
    const input = fs.createReadStream(encryptedPath, { start: 0 });
    // read iv first 16 bytes
    const ivBuf = Buffer.alloc(IV_LENGTH);
    let readBytes = 0;
    const fd = fs.openSync(encryptedPath, "r");

    fs.read(fd, ivBuf, 0, IV_LENGTH, 0, (err) => {
      if (err) return reject(err);
      const iv = ivBuf;
      const decipher = crypto.createDecipheriv(algorithm, KEY, iv);
      const readStream = fs.createReadStream(encryptedPath, { start: IV_LENGTH });
      const outStream = fs.createWriteStream(tmpPath);

      readStream.pipe(decipher).pipe(outStream)
        .on("finish", () => resolve(tmpPath))
        .on("error", (e) => reject(e));
    });
  });
};

export const deleteFileSafe = (p: string) => {
  try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch (err) { console.warn("delete error", err); }
};
