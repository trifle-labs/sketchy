import 'dotenv/config';
import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { apiKeyAuth } from './middleware/auth';
import { uploadImage, submitWorkflow, pollResult, downloadImage } from './comfyui';

const app = express();
const PORT = process.env.PORT ?? 3000;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.post('/generate', apiKeyAuth, upload.single('avatar'), async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No image uploaded' });
    return;
  }

  try {
    const imageName = await uploadImage(req.file.buffer, req.file.originalname);
    const promptId = await submitWorkflow(imageName);
    const outputFilename = await pollResult(promptId);
    const resultBuffer = await downloadImage(outputFilename);

    res.set('Content-Type', 'image/png');
    res.send(resultBuffer);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Generate error:', message);
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`AvatarServant running on http://localhost:${PORT}`);
});
