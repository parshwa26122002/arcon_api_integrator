// filepath: d:/RAMLTOPOSTMAN/server.js
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const router = express.Router();
const upload = multer({ dest: 'uploads/' });


router.post("/convertRamlToPostmanCollection", upload.single('ramlFile'), (req:any, res:any) => {
 console.log("Received file:", req.file);
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  const ramlPath = req.file.path;
  const outputPath = `openapi-${Date.now()}.json`;

  exec(`python raml_to_postman.py ${ramlPath} ${outputPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      fs.unlinkSync(ramlPath); // Clean up RAML file even on error
      return res.status(500).json({ error: "Conversion failed." });
    }

    // res.download(outputPath, () => {
    //   fs.unlinkSync(ramlPath);
    //   fs.unlinkSync(outputPath);
    // });

    fs.readFile(outputPath, "utf8", (err, data) => {
      // Clean up files after reading
      fs.unlinkSync(ramlPath);
      fs.unlinkSync(outputPath);

      if (err) {
        console.error("Failed to read output file:", err);
        return res.status(500).json({ error: "Failed to read output file." });
      }

      try {
        const json = JSON.parse(data);
        console.log("Parsed JSON:", json);
        res.json(json);
      } catch (parseError) {
        console.error("Invalid JSON format:", parseError);
        res.status(500).json({ error: "Invalid JSON format in output file." });
      }
    });
  });
});

export default router;
