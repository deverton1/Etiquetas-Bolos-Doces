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
          pool: pool, // Usar o 'pool' importado diretamente
          tableName: 'session',
          createTableIfMissing: true // Nome da tabela para armazenar sessões
          // Considere adicionar `createTableIfMissing: true` se a tabela não for criada pelo db:push.
        })
      : undefined; // Em desenvolvimento local, se DATABASE_URL não estiver setada, usa MemoryStore

  app.use(session({
    secret: process.env.SESSION_SECRET || 'DOCES_MARA_SEGREDO_DEV_LOCAL_MUITO_SEGURO', // Use uma variável de ambiente forte em produção!
    resave: false,
    saveUninitialized: false,
    store: sessionStore, // Ativar o store condicionalmente
    proxy: process.env.NODE_ENV === 'production', // Mantenha isso, crucial para Render
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Essencial: 'true' em produção (HTTPS)
      // CORREÇÃO: Tentar 'none' para sameSite em produção para compatibilidade cross-subdomain
      // Se 'none' for usado, 'secure: true' é OBRIGATÓRIO (já está garantido em prod).
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // <--- CORREÇÃO AQUI
      httpOnly: true, // Boa prática de segurança para cookies
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    },
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