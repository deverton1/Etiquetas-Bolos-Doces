import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { etiquetas, etiquetaInsertSchema, etiquetaValidationSchema, users, loginSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import bcrypt from "bcryptjs";
import session from "express-session";

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

// Middleware de autenticação
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.user) {
    return next();
  }
  return res.status(401).json({ message: "Não autorizado" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Configuração da sessão aprimorada para produção
  app.use(session({
    secret: process.env.SESSION_SECRET || 'docesmara-segredo',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      // Em produção, só aceita cookies seguros 
      // Em desenvolvimento, aceita cookies não seguros
      secure: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
  }));

  // API prefix
  const apiPrefix = '/api';
  
  // Login
  app.post(`${apiPrefix}/login`, async (req, res) => {
    try {
      // Validar os dados de login
      const dadosLogin = loginSchema.parse(req.body);
      
      // Verificar se o usuário existe
      const usuario = await db.query.users.findFirst({
        where: eq(users.email, dadosLogin.email)
      });
      
      if (!usuario) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      // Verificar a senha
      const senhaCorreta = await bcrypt.compare(dadosLogin.password, usuario.password);
      
      if (!senhaCorreta) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      // Criar sessão
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
      
      // Log mais detalhado para ajudar na depuração
      console.error("Erro ao fazer login:", error);
      console.error("Detalhes do erro:", JSON.stringify(error, null, 2));
      
      // Resposta mais informativa (em produção, você pode querer remover os detalhes do erro)
      return res.status(500).json({ 
        message: "Erro ao fazer login",
        error: process.env.NODE_ENV === 'production' ? 'Erro interno' : String(error)
      });
    }
  });
  
  // Verificar status de autenticação
  app.get(`${apiPrefix}/auth/status`, (req, res) => {
    if (req.session.user) {
      return res.json({ 
        authenticated: true, 
        user: req.session.user 
      });
    }
    return res.json({ authenticated: false });
  });
  
  // Logout
  app.post(`${apiPrefix}/logout`, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      return res.json({ message: "Logout realizado com sucesso" });
    });
  });
  
  // Obter todas as etiquetas
  app.get(`${apiPrefix}/etiquetas`, async (_req, res) => {
    try {
      const todasEtiquetas = await db.query.etiquetas.findMany({
        orderBy: etiquetas.dataCriacao,
      });
      return res.json(todasEtiquetas);
    } catch (error) {
      console.error("Erro ao buscar etiquetas:", error);
      return res.status(500).json({ message: "Erro ao buscar etiquetas" });
    }
  });
  
  // Obter uma etiqueta específica por ID
  app.get(`${apiPrefix}/etiquetas/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const etiqueta = await db.query.etiquetas.findFirst({
        where: eq(etiquetas.id, id),
      });
      
      if (!etiqueta) {
        return res.status(404).json({ message: "Etiqueta não encontrada" });
      }
      
      return res.json(etiqueta);
    } catch (error) {
      console.error("Erro ao buscar etiqueta:", error);
      return res.status(500).json({ message: "Erro ao buscar etiqueta" });
    }
  });
  
  // Criar uma nova etiqueta
  app.post(`${apiPrefix}/etiquetas`, async (req, res) => {
    try {
      // Validar os dados recebidos com coerção de tipos
      const dadosValidados = etiquetaValidationSchema.parse(req.body);
      
      // Remover o campo dataCriacao se presente, pois o banco de dados vai definir automaticamente
      const { dataCriacao, ...dadosParaInserir } = dadosValidados;
      
      // Inserir no banco de dados
      const [novaEtiqueta] = await db.insert(etiquetas)
        .values(dadosParaInserir)
        .returning();
      
      return res.status(201).json(novaEtiqueta);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: "Erro de validação", 
          errors: validationError.message 
        });
      }
      
      console.error("Erro ao criar etiqueta:", error);
      return res.status(500).json({ message: "Erro ao criar etiqueta" });
    }
  });
  
  // Atualizar uma etiqueta existente
  app.patch(`${apiPrefix}/etiquetas/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      // Verificar se a etiqueta existe
      const etiquetaExistente = await db.query.etiquetas.findFirst({
        where: eq(etiquetas.id, id),
      });
      
      if (!etiquetaExistente) {
        return res.status(404).json({ message: "Etiqueta não encontrada" });
      }
      
      // Validar os dados recebidos com coerção de tipos
      const dadosValidados = etiquetaValidationSchema.parse(req.body);
      
      // Remover o campo dataCriacao se presente, para não sobrescrever a data de criação original
      const { dataCriacao, ...dadosParaAtualizar } = dadosValidados;
      
      // Atualizar no banco de dados
      const [etiquetaAtualizada] = await db.update(etiquetas)
        .set(dadosParaAtualizar)
        .where(eq(etiquetas.id, id))
        .returning();
      
      return res.json(etiquetaAtualizada);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: "Erro de validação", 
          errors: validationError.message 
        });
      }
      
      console.error("Erro ao atualizar etiqueta:", error);
      return res.status(500).json({ message: "Erro ao atualizar etiqueta" });
    }
  });
  
  // Excluir uma etiqueta
  app.delete(`${apiPrefix}/etiquetas/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      // Verificar se a etiqueta existe
      const etiquetaExistente = await db.query.etiquetas.findFirst({
        where: eq(etiquetas.id, id),
      });
      
      if (!etiquetaExistente) {
        return res.status(404).json({ message: "Etiqueta não encontrada" });
      }
      
      // Excluir do banco de dados
      await db.delete(etiquetas)
        .where(eq(etiquetas.id, id));
      
      return res.json({ message: "Etiqueta excluída com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir etiqueta:", error);
      return res.status(500).json({ message: "Erro ao excluir etiqueta" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
