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

// Configuração CORS COMPLETA E ÚNICA
const corsOptions = {
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200
};

// LOGS PARA DEPURAR CORS (Mantenha para verificar no Render)
simpleLog(`CORS_ORIGIN_ENV (raw): ${process.env.CORS_ORIGIN}`);
simpleLog(`CORS Options Origin (resolved): ${corsOptions.origin}`);

// APLICAÇÃO ÚNICA DO MIDDLEWARE CORS
app.use(cors(corsOptions));

// Resposta rápida para OPTIONS (Preflight requests)
app.options('*', (req, res) => {
    simpleLog(`BACKEND DEBUG: Handling OPTIONS preflight for: ${req.originalUrl}`); // Log para depuração
    res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*'); // **Muito importante**
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', 'true'); // Se você usa credenciais
    res.sendStatus(200); // Envia 200 OK para o preflight
});

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

  // --- REMOVIDO: BLOCO CORS DUPLICADO AQUI ---
  // const corsOptions = {
  //   origin: process.env.CORS_ORIGIN || true,
  //   credentials: true,
  // };
  // app.use(cors(corsOptions));
  // ------------------------------------------

  // Rota para a raiz do backend (apenas para testar que a API está viva)
  app.get('/', (req, res) => {
    res.json({ message: 'Backend API is running. Access /api routes.' });
  });

  // Middleware para 404: Se nenhuma rota de API corresponder, retorne 404 JSON
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) { // Se a rota não for da API
      res.status(404).json({ message: 'Not Found' });
    } else {
      next(); // Deixe as rotas de API serem tratadas pelo registerRoutes
    }
  });

  const port = 5000;
  server.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      simpleLog(`serving on port ${port}`);
    },
  );
})();