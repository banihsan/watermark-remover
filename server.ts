import express from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';

const execAsync = promisify(exec);

const app = express();
const PORT = 3000;

// Directories
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const PROCESSED_DIR = path.join(process.cwd(), 'processed');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

[UPLOADS_DIR, PROCESSED_DIR, PUBLIC_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Storage configuration for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `video-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.originalname.match(/\.(mp4|mov|avi|mkv|webm)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Format file harus berupa video (MP4, MOV, WEBM, MKV, AVI)'));
    }
  },
});

// Helper function to extract video resolution & duration via FFmpeg
async function getVideoMetadata(filePath: string) {
  try {
    const cmd = `ffmpeg -i "${filePath}" 2>&1`;
    const { stderr, stdout } = await execAsync(cmd).catch((err) => err);
    const output = stderr || stdout || '';

    let width = 1080;
    let height = 1920;
    let duration = 5;

    // Match resolution e.g. 1080x1920
    const resMatch = output.match(/, (\d{2,5})x(\d{2,5})[\s,]/);
    if (resMatch) {
      width = parseInt(resMatch[1], 10);
      height = parseInt(resMatch[2], 10);
    }

    // Match duration e.g. Duration: 00:00:05.90
    const durMatch = output.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}\.\d+)/);
    if (durMatch) {
      const hours = parseFloat(durMatch[1]);
      const minutes = parseFloat(durMatch[2]);
      const seconds = parseFloat(durMatch[3]);
      duration = hours * 3600 + minutes * 60 + seconds;
    }

    return { width, height, duration };
  } catch (error) {
    console.error('Error reading video metadata:', error);
    return { width: 1080, height: 1920, duration: 5 };
  }
}

// Generate thumbnail for video
async function generateThumbnail(videoPath: string, thumbName: string) {
  const thumbPath = path.join(PUBLIC_DIR, thumbName);
  try {
    const cmd = `ffmpeg -y -ss 00:00:01 -i "${videoPath}" -vframes 1 -q:v 2 "${thumbPath}"`;
    await execAsync(cmd);
    return `/public/${thumbName}`;
  } catch (err) {
    console.error('Thumbnail generation failed:', err);
    return null;
  }
}

// Streaming video helper with HTTP Range
function streamFile(req: express.Request, res: express.Response, filePath: string, mimeType = 'video/mp4') {
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File tidak ditemukan' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
      return;
    }

    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mimeType,
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': mimeType,
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
}

// --- API ENDPOINTS ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Sample video info
app.get('/api/sample', async (req, res) => {
  const samplePath = path.join(PUBLIC_DIR, 'sample-video.mp4');
  if (!fs.existsSync(samplePath)) {
    return res.status(404).json({ error: 'Sample video belum dibuat' });
  }

  const meta = await getVideoMetadata(samplePath);
  res.json({
    id: 'sample-video.mp4',
    name: 'Video Podcast Contoh',
    url: '/media/public/sample-video.mp4',
    width: meta.width,
    height: meta.height,
    duration: meta.duration,
    watermarkPreset: {
      name: 'Top-Left Preset',
      // In percent: x=3.5%, y=2.5%, w=22%, h=4.5%
      xPct: 3.5,
      yPct: 2.5,
      wPct: 22,
      hPct: 4.5,
    },
  });
});

// Video File Upload
app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file video yang diunggah' });
    }

    const filename = req.file.filename;
    const filePath = req.file.path;
    const meta = await getVideoMetadata(filePath);
    const thumbName = `thumb-${path.parse(filename).name}.jpg`;
    const thumbUrl = await generateThumbnail(filePath, thumbName);

    res.json({
      id: filename,
      name: req.file.originalname,
      url: `/media/uploads/${filename}`,
      size: req.file.size,
      width: meta.width,
      height: meta.height,
      duration: meta.duration,
      thumbnailUrl: thumbUrl,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Gagal memproses unggahan video' });
  }
});

// Media Stream Endpoint
app.get('/media/:folder/:filename', (req, res) => {
  const { folder, filename } = req.params;
  let targetDir = UPLOADS_DIR;
  if (folder === 'processed') targetDir = PROCESSED_DIR;
  if (folder === 'public') targetDir = PUBLIC_DIR;

  // Prevent directory traversal
  const safeFilename = path.basename(filename);
  const filePath = path.join(targetDir, safeFilename);

  const ext = path.extname(safeFilename).toLowerCase();
  let mimeType = 'video/mp4';
  if (ext === '.webm') mimeType = 'video/webm';
  if (ext === '.mov') mimeType = 'video/quicktime';
  if (ext === '.avi') mimeType = 'video/x-msvideo';
  if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
  if (ext === '.png') mimeType = 'image/png';

  streamFile(req, res, filePath, mimeType);
});

// Explicit File Download Endpoint with Attachment Content-Disposition
app.get('/api/download/:folder/:filename', (req, res) => {
  const { folder, filename } = req.params;
  let targetDir = UPLOADS_DIR;
  if (folder === 'processed') targetDir = PROCESSED_DIR;
  if (folder === 'public') targetDir = PUBLIC_DIR;

  const safeFilename = path.basename(filename);
  const filePath = path.join(targetDir, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File tidak ditemukan' });
  }

  res.download(filePath, safeFilename, (err) => {
    if (err && !res.headersSent) {
      console.error('Download error:', err);
      res.status(500).send('Gagal mengunduh file');
    }
  });
});

// Process Video Endpoint (Watermark Removal)
app.post('/api/process', async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      videoId,
      folder = 'uploads',
      mode = 'delogo', // 'delogo' | 'blur' | 'patch' | 'crop'
      box = { xPct: 3.5, yPct: 2.5, wPct: 22, hPct: 4.5 },
      patchColor = '#1e1e1e',
      blurRadius = 15,
      delogoBand = 1,
    } = req.body;

    let inputPath = path.join(UPLOADS_DIR, path.basename(videoId));
    if (folder === 'public' || videoId === 'sample-video.mp4') {
      inputPath = path.join(PUBLIC_DIR, path.basename(videoId));
    } else if (folder === 'processed') {
      inputPath = path.join(PROCESSED_DIR, path.basename(videoId));
    }

    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ error: 'Video asal tidak ditemukan' });
    }

    const meta = await getVideoMetadata(inputPath);
    const vWidth = meta.width;
    const vHeight = meta.height;

    // Convert percentages to absolute pixel values
    let x = Math.max(0, Math.round((box.xPct / 100) * vWidth));
    let y = Math.max(0, Math.round((box.yPct / 100) * vHeight));
    let w = Math.min(vWidth - x, Math.round((box.wPct / 100) * vWidth));
    let h = Math.min(vHeight - y, Math.round((box.hPct / 100) * vHeight));

    // Ensure even dimensions for FFmpeg libx264 compatibility
    if (w % 2 !== 0) w += 1;
    if (h % 2 !== 0) h += 1;
    if (x % 2 !== 0) x = Math.max(0, x - 1);
    if (y % 2 !== 0) y = Math.max(0, y - 1);
    w = Math.max(16, w);
    h = Math.max(16, h);

    const outputFilename = `clean-${Date.now()}-${path.basename(videoId)}`;
    const outputPath = path.join(PROCESSED_DIR, outputFilename);

    let filterOption = '';

    if (mode === 'delogo') {
      // Delogo filter smoothly interpolates pixels surrounding the bounding box
      filterOption = `-vf "delogo=x=${x}:y=${y}:w=${w}:h=${h}:show=0"`;
    } else if (mode === 'blur') {
      // Crop area, apply heavy boxblur, overlay back on top
      const blurAmount = Math.max(5, Math.min(50, blurRadius));
      filterOption = `-filter_complex "[0:v]crop=${w}:${h}:${x}:${y},boxblur=${blurAmount}:${blurAmount}[blurred];[0:v][blurred]overlay=${x}:${y}[out]" -map "[out]" -map 0:a?`;
    } else if (mode === 'patch') {
      // Draw solid color box over the region
      let hexColor = patchColor.replace('#', '');
      if (hexColor.length === 3) {
        hexColor = hexColor.split('').map((c) => c + c).join('');
      }
      filterOption = `-vf "drawbox=x=${x}:y=${y}:w=${w}:h=${h}:color=0x${hexColor}@1.0:t=fill"`;
    } else if (mode === 'crop') {
      // Crop entire video frame excluding the top/side where watermark is
      // If watermark is at top, crop top out
      const cropX = Math.round(x + w < vWidth / 2 ? x + w : 0);
      const cropY = Math.round(y + h < vHeight / 2 ? y + h : 0);
      const cropW = vWidth - cropX;
      const cropH = vHeight - cropY;
      filterOption = `-vf "crop=${cropW}:${cropH}:${cropX}:${cropY}"`;
    } else {
      filterOption = `-vf "delogo=x=${x}:y=${y}:w=${w}:h=${h}:show=0"`;
    }

    // Fast x264 encoding command
    const ffmpegCmd = `ffmpeg -y -i "${inputPath}" ${filterOption} -c:a copy -c:v libx264 -preset ultrafast -pix_fmt yuv420p "${outputPath}"`;
    
    console.log('Executing FFmpeg command:', ffmpegCmd);
    await execAsync(ffmpegCmd);

    const processDuration = Date.now() - startTime;
    const stat = fs.statSync(outputPath);
    const cleanMeta = await getVideoMetadata(outputPath);

    res.json({
      success: true,
      processedUrl: `/media/processed/${outputFilename}`,
      filename: outputFilename,
      size: stat.size,
      width: cleanMeta.width,
      height: cleanMeta.height,
      duration: cleanMeta.duration,
      mode,
      appliedBox: { x, y, w, h },
      processingTimeMs: processDuration,
    });
  } catch (err: any) {
    console.error('Process error:', err);
    res.status(500).json({
      error: err.message || 'Gagal menghapus watermark dari video',
      details: err.stderr || err.toString(),
    });
  }
});

// Start Express + Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Watermark Remover berjalan di http://localhost:${PORT}`);
  });
}

startServer();
