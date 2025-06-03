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
import { pgTable, text, serial, timestamp, integer, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
var etiquetas = pgTable("etiquetas", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  descricao: text("descricao").notNull(),
  dataFabricacao: text("data_fabricacao").notNull(),
  dataValidade: text("data_validade").notNull(),
  diasValidade: integer("dias_validade").notNull().default(5),
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
  dataCriacao: z.date().optional(),
  // para permitir que a data de criação seja opcional na inserção
  diasValidade: z.number().int().min(1, "Dias de validade inv\xE1lidos").default(5)
});
var etiquetaSelectSchema = createSelectSchema(etiquetas);
var etiquetaValidationSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(5, "A descri\xE7\xE3o deve ter pelo menos 5 caracteres"),
  dataFabricacao: z.string().min(1, "Selecione a data de fabrica\xE7\xE3o"),
  dataValidade: z.string().min(1, "Selecione a data de validade"),
  diasValidade: z.number().int().min(1, "Dias de validade inv\xE1lidos").default(5),
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
import { eq } from "drizzle-orm";
import { z as z2 } from "zod";
import { fromZodError } from "zod-validation-error";
import bcrypt from "bcryptjs";
import session from "express-session";
import pgSession from "connect-pg-simple";
async function registerRoutes(app2) {
  console.log("BACKEND ROUTE LOG: registerRoutes initiated (A).");
  const PgStore = pgSession(session);
  console.log("BACKEND ROUTE LOG: PgStore instantiated (B).");
  const sessionStore = process.env.NODE_ENV === "production" && process.env.DATABASE_URL ? new PgStore({
    pool,
    tableName: "session",
    createTableIfMissing: true
  }) : void 0;
  console.log("BACKEND ROUTE LOG: sessionStore configured (C).");
  app2.use(session({
    // CORREÇÃO AQUI: Garante que o secret é uma string para TypeScript
    // Usa a variável de ambiente, ou um fallback robusto.
    // A asserção 'as string' força o TypeScript a aceitar que o resultado é uma string.
    secret: process.env.SESSION_SECRET || "uma_chave_secreta_segura_para_dev_local_e_fallback",
    // <--- CORRIGIDO AQUI
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    // Continua usando MemoryStore para teste
    proxy: true,
    cookie: {
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
    }
  }));
  console.log("BACKEND ROUTE LOG: session middleware applied (D).");
  const apiPrefix = "/api";
  app2.post(`${apiPrefix}/login`, async (req, res) => {
    try {
      const dadosLogin = loginSchema.parse(req.body);
      const usuario = await db.query.users.findFirst({
        where: eq(users.email, dadosLogin.email)
      });
      if (!usuario) {
        return res.status(401).json({ message: "Credenciais inv\xE1lidas" });
      }
      const senhaCorreta = await bcrypt.compare(dadosLogin.password, usuario.password);
      if (!senhaCorreta) {
        return res.status(401).json({ message: "Credenciais inv\xE1lidas" });
      }
      req.session.user = {
        id: usuario.id,
        email: usuario.email,
        isAdmin: usuario.isAdmin
      };
      return res.json({
        message: "Login realizado com sucesso",
        user: {
          id: usuario.id,
          email: usuario.email,
          isAdmin: usuario.isAdmin
        }
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({
          message: "Erro de valida\xE7\xE3o",
          errors: validationError.message
        });
      }
      console.error("Erro ao fazer login:", error);
      return res.status(500).json({
        message: "Erro ao fazer login",
        error: process.env.NODE_ENV === "production" ? "Erro interno" : String(error)
      });
    }
  });
  app2.get(`${apiPrefix}/auth/status`, (req, res) => {
    console.log("BACKEND ROUTE LOG: Inside GET /api/auth/status handler (E).");
    try {
      const userInSession = req.session.user;
      console.log("BACKEND ROUTE LOG: req.session.user accessed (F). User:", userInSession?.email);
      if (userInSession) {
        console.log("BACKEND ROUTE LOG: User found in session (G).");
        return res.json({
          authenticated: true,
          user: userInSession
        });
      }
      console.log("BACKEND ROUTE LOG: No user in session, sending unauthenticated (H).");
      return res.json({ authenticated: false });
    } catch (err) {
      console.error("BACKEND ROUTE ERROR: Error accessing session in /auth/status:", err);
      return res.status(500).json({ message: "Internal server error during session access." });
    }
  });
  app2.post(`${apiPrefix}/logout`, async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      return res.json({ message: "Logout realizado com sucesso" });
    });
  });
  app2.get(`${apiPrefix}/etiquetas`, async (_req, res) => {
    try {
      const todasEtiquetas = await db.query.etiquetas.findMany({
        orderBy: etiquetas.dataCriacao
      });
      return res.json(todasEtiquetas);
    } catch (error) {
      console.error("Erro ao buscar etiquetas:", error);
      return res.status(500).json({ message: "Erro ao buscar etiquetas" });
    }
  });
  app2.get(`${apiPrefix}/etiquetas/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inv\xE1lido" });
      }
      const etiqueta = await db.query.etiquetas.findFirst({
        where: eq(etiquetas.id, id)
      });
      if (!etiqueta) {
        return res.status(404).json({ message: "Etiqueta n\xE3o encontrada" });
      }
      return res.json(etiqueta);
    } catch (error) {
      console.error("Erro ao buscar etiqueta:", error);
      return res.status(500).json({ message: "Erro ao buscar etiqueta" });
    }
  });
  app2.post(`${apiPrefix}/etiquetas`, async (req, res) => {
    try {
      const dadosValidados = etiquetaValidationSchema.parse(req.body);
      const { dataCriacao, ...dadosParaInserir } = dadosValidados;
      const [novaEtiqueta] = await db.insert(etiquetas).values(dadosParaInserir).returning();
      return res.status(201).json(novaEtiqueta);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({
          message: "Erro de valida\xE7\xE3o",
          errors: validationError.message
        });
      }
      console.error("Erro ao criar etiqueta:", error);
      return res.status(500).json({ message: "Erro ao criar etiqueta" });
    }
  });
  app2.patch(`${apiPrefix}/etiquetas/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inv\xE1lido" });
      }
      const etiquetaExistente = await db.query.etiquetas.findFirst({
        where: eq(etiquetas.id, id)
      });
      if (!etiquetaExistente) {
        return res.status(404).json({ message: "Etiqueta n\xE3o encontrada" });
      }
      const dadosValidados = etiquetaValidationSchema.parse(req.body);
      const { dataCriacao, ...dadosParaAtualizar } = dadosValidados;
      const [etiquetaAtualizada] = await db.update(etiquetas).set(dadosParaAtualizar).where(eq(etiquetas.id, id)).returning();
      return res.json(etiquetaAtualizada);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({
          message: "Erro de valida\xE7\xE3o",
          errors: validationError.message
        });
      }
      console.error("Erro ao atualizar etiqueta:", error);
      return res.status(500).json({ message: "Erro ao atualizar etiqueta" });
    }
  });
  app2.delete(`${apiPrefix}/etiquetas/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inv\xE1lido" });
      }
      const etiquetaExistente = await db.query.etiquetas.findFirst({
        where: eq(etiquetas.id, id)
      });
      if (!etiquetaExistente) {
        return res.status(404).json({ message: "Etiqueta n\xE3o encontrada" });
      }
      await db.delete(etiquetas).where(eq(etiquetas.id, id));
      return res.json({ message: "Etiqueta exclu\xEDda com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir etiqueta:", error);
      return res.status(500).json({ message: "Erro ao excluir etiqueta" });
    }
  });
  const httpServer = createServer(app2);
  console.log("BACKEND ROUTE LOG: httpServer created (I).");
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
app.use((req, res, next) => {
  console.log(`BACKEND DEBUG: Request received: ${req.method} ${req.originalUrl}`);
  next();
});
var corsOptions = {
  origin: process.env.CORS_ORIGIN || true,
  // Usa a variável de ambiente ou permite tudo em dev
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
