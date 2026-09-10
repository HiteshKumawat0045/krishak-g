import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

function rawAssetServePlugin(): Plugin {
  return {
    name: "raw-asset-serve-plugin",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && (req.url.startsWith("/ort/") || req.url.startsWith("/vad/"))) {
          const cleanUrl = req.url.split("?")[0];
          const filePath = path.join(__dirname, "public", cleanUrl);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath);
            let contentType = "application/octet-stream";
            if (ext === ".wasm") contentType = "application/wasm";
            else if (ext === ".mjs" || ext === ".js") contentType = "text/javascript";
            else if (ext === ".onnx") contentType = "application/octet-stream";
            
            res.setHeader("Content-Type", contentType);
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Cache-Control", "no-cache");
            return fs.createReadStream(filePath).pipe(res);
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), rawAssetServePlugin()],
  assetsInclude: ["**/*.wasm", "**/*.onnx"],
  optimizeDeps: {
    include: ["@ricky0123/vad-web", "onnxruntime-web"]
  },
  server: {
    port: 3000,
    strictPort: true
  }
});
