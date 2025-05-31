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

// Middleware de depuração para registrar todas as requisições (removido log agressivo)
app.use((req, res, next) => {
  console.log(`BACKEND DEBUG: Request received: ${req.method} ${req.originalUrl}`); // LOG MUITO AGRESSIVO
  next();
});

// Configuração CORS COMPLETA E ÚNICA (no local correto)
const corsOptions = {
  origin: process.env.CORS_ORIGIN || true, // Usa a variável de ambiente ou permite tudo em dev
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200
};

// LOGS PARA DEPURAR CORS (Mantenha para verificar no Render)
simpleLog(`CORS_ORIGIN_ENV (raw): ${process.env.CORS_ORIGIN}`);
simpleLog(`CORS Options Origin (resolved): ${corsOptions.origin}`);

// APLICAÇÃO ÚNICA E CORRETA DO MIDDLEWARE CORS
app.use(cors(corsOptions));

// TRATAR REQUISIÇÕES OPTIONS MANUALMENTE (como um fallback/segurança extra)
// Isso é o que tínhamos adicionado para garantir o preflight
app.options('*', (req, res) => {
    simpleLog(`BACKEND DEBUG: Handling OPTIONS preflight for: ${req.originalUrl}`);
    res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*'); // Deve corresponder à origem
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});

// Body parsers (devem vir DEPOIS do middleware CORS)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
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

  // Rota para a raiz do backend (apenas para testar que a API está viva)
  app.get('/', (req, res) => {
    res.json({ message: 'Backend API is running. Access /api routes.' });
  });

  // Middleware para 404: Se nenhuma rota de API corresponder, retorne 404 JSON
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.status(404).json({ message: 'Not Found' });
    } else {
      next();
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