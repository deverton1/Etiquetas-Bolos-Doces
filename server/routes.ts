import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
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
  console.log('BACKEND ROUTE LOG: registerRoutes initiated (A).'); // LOG A - NOVO
  // Configuração do store para sessões
  const PgStore = pgSession(session);
  console.log('BACKEND ROUTE LOG: PgStore instantiated (B).'); // LOG B - NOVO

  const sessionStore = 
    process.env.NODE_ENV === 'production' && process.env.DATABASE_URL
      ? new PgStore({
          pool: pool, // Usar o 'pool' importado diretamente
          tableName: 'session',
          createTableIfMissing: true // Vamos manter isso para garantir que a tabela seja criada
        })
      : undefined; // Em desenvolvimento local, se DATABASE_URL não estiver setada, usa MemoryStore

  console.log('BACKEND ROUTE LOG: sessionStore configured (C).'); // LOG C - NOVO

  app.use(session({
    secret: process.env.SESSION_SECRET || 'DOCES_MARA_SEGREDO_DEV_LOCAL_MUITO_SEGURO', // Use uma variável de ambiente forte em produção!
    resave: false,
    saveUninitialized: false,
    store: sessionStore, // Ativar o store condicionalmente
    proxy: process.env.NODE_ENV === 'production', // Mantenha isso, crucial para Render
    cookie: {
      secure: process.env.NODE_ENV === 'production', 
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // <--- CORREÇÃO AQUI
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 
    },
  }));
  console.log('BACKEND ROUTE LOG: session middleware applied (D).'); // LOG D - NOVO

  // API prefix
  const apiPrefix = '/api';

  // Login
  app.post(`${apiPrefix}/login`, async (req, res) => {
    // ... (sua lógica de login)
    try {
      const dadosLogin = loginSchema.parse(req.body);
      const usuario = await db.query.users.findFirst({
        where: eq(users.email, dadosLogin.email)
      });
      if (!usuario) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      const senhaCorreta = await bcrypt.compare(dadosLogin.password, usuario.password);
      if (!senhaCorreta) {
        return res.status(401).json({ message: "Credenciais inválidas" });
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
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({
          message: "Erro de validação",
          errors: validationError.message
        });
      }
      console.error("Erro ao fazer login:", error);
      return res.status(500).json({
        message: "Erro ao fazer login",
        error: process.env.NODE_ENV === 'production' ? 'Erro interno' : String(error)
      });
    }
  });

  // Verificar status de autenticação
  app.get(`${apiPrefix}/auth/status`, (req, res) => {
    console.log('BACKEND ROUTE LOG: Inside GET /api/auth/status handler (E).'); // LOG E - NOVO
    try { // Adicionado try-catch para depurar acesso à sessão
      const userInSession = req.session.user; // Este acesso pode travar
      console.log('BACKEND ROUTE LOG: req.session.user accessed (F). User:', userInSession?.email); // LOG F - NOVO
      if (userInSession) { 
        console.log('BACKEND ROUTE LOG: User found in session (G).'); // LOG G - NOVO
        return res.json({ 
          authenticated: true, 
          user: userInSession 
        });
      }
      console.log('BACKEND ROUTE LOG: No user in session, sending unauthenticated (H).'); // LOG H - NOVO
      return res.json({ authenticated: false });
    } catch (err) {
      console.error('BACKEND ROUTE ERROR: Error accessing session in /auth/status:', err); // ERRO LOG - NOVO
      return res.status(500).json({ message: 'Internal server error during session access.' });
    }
  });

  // Logout
  app.post(`${apiPrefix}/logout`, async (req, res) => {
    // ... (sua lógica de logout)
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      return res.json({ message: "Logout realizado com sucesso" });
    });
  });

  // ... (outras rotas de etiquetas)

  const httpServer = createServer(app);
  console.log('BACKEND ROUTE LOG: httpServer created (I).'); // LOG I - NOVO
  return httpServer;
}