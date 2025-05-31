import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url"; // ADICIONADO: Para converter import.meta.url em caminho de arquivo

const app = express();

// Função de log simples para substituir 'log' de server/vite.ts
const simpleLog = (message: string) => {
  console.log(`[SERVER] ${message}`);
};

// Configuração CORS simplificada
const corsOptions = {
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path; // Renomeado para evitar conflito com 'path' do módulo
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) { // Usando reqPath
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      simpleLog(logLine);
    }
  });

  next();
});

// Define __dirname para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (process.env.NODE_ENV === "production") {
    // CORREÇÃO AQUI: O caminho para os arquivos estáticos agora está dentro de server-build/public
    // Já que server-build/index.js estará na raiz do projeto (após o build)
    // e server/index.ts estará em /opt/render/project/src/server/
    // precisamos subir um nível para a raiz e ir para server-build/public
    const clientDistPath = path.resolve(__dirname, '../server-build/public'); // <--- CORRIGIDO
    app.use(express.static(clientDistPath));

    app.get('*', (req, res) => {
      res.sendFile(path.resolve(clientDistPath, 'index.html'));
    });
  } else {
    simpleLog('Modo de desenvolvimento: O frontend é servido pelo Vite dev server.');
  }

  const port = 5000;
  // REMOVEMOS reusePort: true para simplicidade e compatibilidade local
  server.listen(
    {
      port,
      host: "0.0.0.0", // Manter 0.0.0.0 para que possa ser acessado de outras máquinas na rede, ou use 'localhost'
    },
    () => {
      simpleLog(`serving on port ${port}`);
    },
  );
})();