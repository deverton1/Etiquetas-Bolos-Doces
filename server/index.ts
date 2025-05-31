import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import { registerRoutes } from "./routes";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚩 CORS correto
const corsOptions = {
  origin: 'https://docesmara-frontend.onrender.com',
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
};
app.use(cors(corsOptions));

// 🚩 Sessão (se usa autenticação via cookie)
app.use(session({
  secret: 'sua-chave-secreta',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: 'none',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logs de requisições API
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse = undefined;

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
      console.log(`[SERVER] ${logLine}`);
    }
  });

  next();
});

// Rota de status simples
app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running. Access /api routes.' });
});

// Rotas API
await registerRoutes(app);

// Middleware 404
app.use((req, res) => {
  if (!req.path.startsWith('/api')) {
    res.status(404).json({ message: 'Not Found' });
  }
});

const port = 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`[SERVER] serving on port ${port}`);
});
