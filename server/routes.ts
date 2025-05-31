import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
// Correção 1: Importar 'pool' junto com 'db'
import { db, pool } from "../db"; // <--- ADICIONADO 'pool' AQUI
import { etiquetas, etiquetaInsertSchema, users, loginSchema } from "../shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import bcrypt from "bcryptjs";
import session from "express-session";
import pgSession from 'connect-pg-simple'; // <-- Mantenha esta importação ativa

// Tipo personalizado para sessão
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      email: string;
      isAdmin: boolean;
    };
  }
}

// Middleware de autenticação (mantido comentado para teste)
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.user) {
    return next();
  }
  return res.status(401).json({ message: "Não autorizado" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Configuração do store para sessões
  const PgStore = pgSession(session);
  const sessionStore = 
    process.env.NODE_ENV === 'production' && process.env.DATABASE_URL
      ? new PgStore({
          pool: pool, // <--- Correção 2: Usar o 'pool' importado diretamente
          tableName: 'session' // Nome da tabela para armazenar sessões
          // Se sua tabela 'session' não for criada automaticamente pelo db:push,
          // considere adicionar `createTableIfMissing: true` aqui, mas isso é mais para dev.
        })
      : undefined; // Em desenvolvimento local, se DATABASE_URL não estiver setada, usa MemoryStore

  app.use(session({
    // Correção 3: Use uma variável de ambiente forte em produção!
    secret: process.env.SESSION_SECRET || 'DOCES_MARA_SEGREDO_DEV_LOCAL_MUITO_SEGURO', 
    resave: false,
    saveUninitialized: false,
    store: sessionStore, // <--- Correção 4: Ativar o store condicionalmente
    cookie: {
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax', // Ótimo para o mesmo domínio
      // Se 'lax' não funcionar no deploy, tente 'none' (requer HTTPS)
      // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Exemplo
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 
    },
    proxy: process.env.NODE_ENV === 'production', // <--- Mantenha isso, crucial para Render
  }));

  // API prefix
  const apiPrefix = '/api';

  // ... (Resto das rotas, sem alterações)

  // Login
  app.post(`${apiPrefix}/login`, async (req, res) => { /* ... */ });
  app.get(`${apiPrefix}/auth/status`, (req, res) => { /* ... */ });
  app.post(`${apiPrefix}/logout`, (req, res) => { /* ... */ });
  app.get(`${apiPrefix}/etiquetas`, async (_req, res) => { /* ... */ });
  app.get(`${apiPrefix}/etiquetas/:id`, async (req, res) => { /* ... */ });
  app.post(`${apiPrefix}/etiquetas`, async (req, res) => { /* ... */ });
  app.patch(`${apiPrefix}/etiquetas/:id`, async (req, res) => { /* ... */ });
  app.delete(`${apiPrefix}/etiquetas/:id`, async (req, res) => { /* ... */ });

  const httpServer = createServer(app);
  return httpServer;
}