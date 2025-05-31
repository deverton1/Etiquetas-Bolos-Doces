var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express from "express";

// server/routes.ts
import { createServer } from "http";

// db/index.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  etiquetaInsertSchema: () => etiquetaInsertSchema,
  etiquetaSelectSchema: () => etiquetaSelectSchema,
  etiquetaValidationSchema: () => etiquetaValidationSchema,
  etiquetas: () => etiquetas,
  loginSchema: () => loginSchema,
  nutrienteAdicionalSchema: () => nutrienteAdicionalSchema,
  userInsertSchema: () => userInsertSchema,
  userSelectSchema: () => userSelectSchema,
  users: () => users
});
import { pgTable, text, serial, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
var etiquetas = pgTable("etiquetas", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  descricao: text("descricao").notNull(),
  dataFabricacao: text("data_fabricacao").notNull(),
  dataValidade: text("data_validade").notNull(),
  porcao: text("porcao").notNull(),
  unidadePorcao: text("unidade_porcao").notNull().default("g"),
  valorEnergetico: text("valor_energetico").notNull(),
  unidadeEnergetico: text("unidade_energetico").notNull().default("kcal"),
  carboidratos: text("carboidratos").notNull(),
  acucares: text("acucares").notNull(),
  proteinas: text("proteinas").notNull(),
  gordurasTotais: text("gorduras_totais").notNull(),
  gordurasSaturadas: text("gorduras_saturadas").notNull(),
  sodio: text("sodio").notNull(),
  fibras: text("fibras").notNull(),
  // O $type é importante aqui, ele diz ao Drizzle que este JSON é um array de NutrienteAdicional
  nutrientesAdicionais: json("nutrientes_adicionais").$type(),
  dataCriacao: timestamp("data_criacao").defaultNow().notNull()
});
var nutrienteAdicionalSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(1, "O nome do nutriente \xE9 obrigat\xF3rio"),
  valor: z.number().min(0, "O valor do nutriente deve ser um n\xFAmero n\xE3o negativo"),
  unidade: z.string().min(1, "A unidade do nutriente \xE9 obrigat\xF3ria")
});
var etiquetaInsertSchema = createInsertSchema(etiquetas, {
  // Sobrescrever a validação de `nutrientesAdicionais` do Drizzle-Zod
  // para usar o schema Zod definido manualmente.
  nutrientesAdicionais: z.array(nutrienteAdicionalSchema).optional().nullable(),
  dataCriacao: z.date().optional()
  // para permitir que a data de criação seja opcional na inserção
});
var etiquetaSelectSchema = createSelectSchema(etiquetas);
var etiquetaValidationSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(5, "A descri\xE7\xE3o deve ter pelo menos 5 caracteres"),
  dataFabricacao: z.string().min(1, "Selecione a data de fabrica\xE7\xE3o"),
  dataValidade: z.string().min(1, "Selecione a data de validade"),
  porcao: z.string().min(1, "Informe a por\xE7\xE3o"),
  unidadePorcao: z.string(),
  valorEnergetico: z.string().min(1, "Informe o valor energ\xE9tico"),
  unidadeEnergetico: z.string(),
  carboidratos: z.string().min(1, "Informe os carboidratos"),
  acucares: z.string().min(1, "Informe os a\xE7\xFAcares"),
  proteinas: z.string().min(1, "Informe as prote\xEDnas"),
  gordurasTotais: z.string().min(1, "Informe as gorduras totais"),
  gordurasSaturadas: z.string().min(1, "Informe as gorduras saturadas"),
  sodio: z.string().min(1, "Informe o s\xF3dio"),
  fibras: z.string().min(1, "Informe as fibras"),
  // **CORREÇÃO AQUI:** Definir como um array de nutrienteAdicionalSchema
  nutrientesAdicionais: z.array(nutrienteAdicionalSchema).optional().nullable(),
  // Aceita array de NutrienteAdicional ou null/undefined
  dataCriacao: z.date().optional()
});
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var userInsertSchema = createInsertSchema(users);
var userSelectSchema = createSelectSchema(users);
var loginSchema = z.object({
  email: z.string().email("Email inv\xE1lido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
});

// db/index.ts
import "dotenv/config";
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}
var pool = new Pool({
  // <--- Cria o Pool do 'pg'
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});
var db = drizzle(pool, { schema: schema_exports });
pool.on("error", (err) => {
  console.error("Erro inesperado no pool do banco de dados:", err);
  process.exit(-1);
});
pool.connect().then((client) => {
  console.log("Conex\xE3o com o banco de dados estabelecida com sucesso!");
  client.release();
}).catch((err) => {
  console.error("Falha ao conectar ao banco de dados na inicializa\xE7\xE3o:", err);
});

// server/routes.ts
import session from "express-session";
import pgSession from "connect-pg-simple";
async function registerRoutes(app2) {
  const PgStore = pgSession(session);
  const sessionStore = process.env.NODE_ENV === "production" && process.env.DATABASE_URL ? new PgStore({
    pool,
    // Usar o 'pool' importado diretamente
    tableName: "session",
    createTableIfMissing: true
    // Nome da tabela para armazenar sessões
    // Considere adicionar `createTableIfMissing: true` se a tabela não for criada pelo db:push.
  }) : void 0;
  app2.use(session({
    secret: process.env.SESSION_SECRET || "DOCES_MARA_SEGREDO_DEV_LOCAL_MUITO_SEGURO",
    // Use uma variável de ambiente forte em produção!
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    // Ativar o store condicionalmente
    proxy: process.env.NODE_ENV === "production",
    // Mantenha isso, crucial para Render
    cookie: {
      secure: process.env.NODE_ENV === "production",
      // Essencial: 'true' em produção (HTTPS)
      // CORREÇÃO: Tentar 'none' para sameSite em produção para compatibilidade cross-subdomain
      // Se 'none' for usado, 'secure: true' é OBRIGATÓRIO (já está garantido em prod).
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      // <--- CORREÇÃO AQUI
      httpOnly: true,
      // Boa prática de segurança para cookies
      maxAge: 24 * 60 * 60 * 1e3
      // 24 horas
    }
  }));
  const apiPrefix = "/api";
  app2.post(`${apiPrefix}/login`, async (req, res) => {
  });
  app2.get(`${apiPrefix}/auth/status`, (req, res) => {
  });
  app2.post(`${apiPrefix}/logout`, (req, res) => {
  });
  app2.get(`${apiPrefix}/etiquetas`, async (_req, res) => {
  });
  app2.get(`${apiPrefix}/etiquetas/:id`, async (req, res) => {
  });
  app2.post(`${apiPrefix}/etiquetas`, async (req, res) => {
  });
  app2.patch(`${apiPrefix}/etiquetas/:id`, async (req, res) => {
  });
  app2.delete(`${apiPrefix}/etiquetas/:id`, async (req, res) => {
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
var app = express();
var simpleLog = (message) => {
  console.log(`[SERVER] ${message}`);
};
var corsOptions = {
  // CORREÇÃO AQUI: Voltar para usar a variável de ambiente
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200
};
simpleLog(`CORS_ORIGIN_ENV (raw): ${process.env.CORS_ORIGIN}`);
simpleLog(`CORS Options Origin (resolved): ${corsOptions.origin}`);
app.use(cors(corsOptions));
app.options("*", (req, res) => {
  simpleLog(`BACKEND DEBUG: Handling OPTIONS preflight for: ${req.originalUrl}`);
  res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
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
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      simpleLog(logLine);
    }
  });
  next();
});
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
(async () => {
  const server = await registerRoutes(app);
  app.get("/", (req, res) => {
    res.json({ message: "Backend API is running. Access /api routes." });
  });
  app.use((req, res, next) => {
    if (!req.path.startsWith("/api")) {
      res.status(404).json({ message: "Not Found" });
    } else {
      next();
    }
  });
  const port = 5e3;
  server.listen(
    {
      port,
      host: "0.0.0.0"
    },
    () => {
      simpleLog(`serving on port ${port}`);
    }
  );
})();
