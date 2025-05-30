// routes/authenticate.ts
import express from "express";
import multer from "multer";
import fs from "fs";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // keeps file in memory

const crypto = require('crypto');

// Secret key and IV — in real use, store securely!
const ENCRYPTION_KEY = crypto.createHash('sha256').update('@secretKey123').digest(); // 32 bytes
const IV = Buffer.alloc(16, 0); // 16-byte IV (for simplicity, fixed here)

function encrypt(text: string): string {
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encryptedText:string): string {
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function extractTokenFromFile(buffer: Buffer): string | null {
  try {
    // For plain text file, just return the content as string
    console.log("Extracting token from file");
    return buffer.toString("utf-8").trim();
  } catch (error) {
    console.log("Error reading file:", error);
    return null;
  }
}

function isValidToken(token: string): boolean {

  //Decrypt token
  //console.log(encrypt("!)@(#*$&%^"));
  token = decrypt(token);
  return token === "!)@(#*$&%^";
}

router.post("/authenticate", upload.single("file"), (req, res) => {
  console.log("Authenticating");

  const file = req.file;

  if (file) {
    const token = extractTokenFromFile(file.buffer);

    if (token && isValidToken(token)) {
      res.status(200).json({ authenticated: true });
    } else {
      res.status(401).json({ authenticated: false });
    }
  } else {
    console.error("File not found");
    res.status(400).json({ message: "File not found" });
  }
});

export default router;
