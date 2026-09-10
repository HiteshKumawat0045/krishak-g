import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");
const publicDir = path.join(projectRoot, "public");

// 1. Copy VAD assets from node_modules/@ricky0123/vad-web/dist/ to frontend/public/vad/
const vadDist = path.join(projectRoot, "node_modules", "@ricky0123", "vad-web", "dist");
const vadTarget = path.join(publicDir, "vad");
fs.mkdirSync(vadTarget, { recursive: true });

const vadFiles = [
  "vad.worklet.bundle.min.js",
  "silero_vad_legacy.onnx",
  "silero_vad_v5.onnx"
];

for (const file of vadFiles) {
  const src = path.join(vadDist, file);
  const dest = path.join(vadTarget, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`[copy-assets] Copied ${file} to public/vad/`);
  } else {
    console.warn(`[copy-assets] Warning: ${src} not found`);
  }
}

// 2. Copy ORT assets (.wasm and .mjs) from node_modules/onnxruntime-web/dist/ to frontend/public/ort/
const ortDist = path.join(projectRoot, "node_modules", "onnxruntime-web", "dist");
const ortTarget = path.join(publicDir, "ort");
fs.mkdirSync(ortTarget, { recursive: true });

if (fs.existsSync(ortDist)) {
  const ortFiles = fs.readdirSync(ortDist);
  for (const file of ortFiles) {
    if (file.endsWith(".wasm") || file.endsWith(".mjs")) {
      fs.copyFileSync(path.join(ortDist, file), path.join(ortTarget, file));
      console.log(`[copy-assets] Copied ${file} to public/ort/`);
    }
  }
} else {
  console.warn(`[copy-assets] Warning: ${ortDist} not found`);
}
