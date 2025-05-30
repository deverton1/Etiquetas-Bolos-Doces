// C:\Users\evert\Desktop\EtiquetaDoceira\vite.config.ts (versão limpa da raiz)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url"; // Para usar __dirname em ESM

// Recria __dirname para ESM, pois import.meta.dirname não existe nativamente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    // REMOVIDO: runtimeErrorOverlay() e o import
    // REMOVIDO: os imports condicionais do cartographer
  ],
  resolve: {
    alias: {
      "@db": path.resolve(__dirname, "db"),
      "@": path.resolve(__dirname, "client", "src"), // Aponta para o src do cliente
      "@shared": path.resolve(__dirname, "shared"),
      // "@assets": path.resolve(__dirname, "attached_assets"), // Manter se você usa esta pasta
    },
  },
  // root aponta para a pasta client como a raiz do frontend para o Vite
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"), // Onde o frontend buildado será colocado
    emptyOutDir: true,
  },
});