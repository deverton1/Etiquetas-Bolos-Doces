import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { db } from "../db"; // Certifique-se de que este @db aponta para o seu server/src/db/index.ts
import { etiquetas, etiquetaInsertSchema, users, loginSchema } from "../shared/schema"; // Removi 'etiquetaValidationSchema' porque não está sendo usada, apenas 'etiquetaInsertSchema' com parse
import { eq } from "drizzle-orm";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import bcrypt from "bcryptjs";
import session from "express-session";
// import pgSession from 'connect-pg-simple'; // Removido por enquanto para simplicidade em memória

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
  // Configuração da sessão otimizada e segura
  // Para desenvolvimento local e simplicidade, usaremos o armazenamento de sessão em memória padrão
  // Se precisar de persistência de sessão em PostgreSQL local, você pode descomentar e configurar o connect-pg-simple
  app.use(session({
    secret: process.env.SESSION_SECRET || 'docesmara-segredo', // Use uma variável de ambiente real em produção
    resave: false,
    saveUninitialized: false,
    cookie: {
      // Em produção, 'secure' deve ser true e 'sameSite' pode ser 'none' com proxy,
      // mas 'lax' é mais seguro e funciona bem para maioria dos cenários de dev/prod sem proxy complexo
      secure: process.env.NODE_ENV === 'production', // Use HTTPS em produção para isso
      sameSite: 'lax', // 'lax' é um bom balanço para segurança e funcionalidade em muitos setups
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    },
    // store: new (pgSession(session))({
    //   pool: db.pool, // Assumindo que 'db' tem um pool acessível, como exportado de server/src/db/index.ts
    //   tableName: 'session' // Nome da tabela para armazenar sessões
    // })
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

      console.error("Erro ao fazer login:", error);

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
  // app.get(`${apiPrefix}/etiquetas`, isAuthenticated, async (_req, res) => { // Descomente para proteger a rota
  app.get(`${apiPrefix}/etiquetas`, async (_req, res) => { // Mantenha assim para testar sem autenticação
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
  // app.get(`${apiPrefix}/etiquetas/:id`, isAuthenticated, async (req, res) => { // Descomente para proteger a rota
  app.get(`${apiPrefix}/etiquetas/:id`, async (req, res) => { // Mantenha assim para testar sem autenticação
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
  // app.post(`${apiPrefix}/etiquetas`, isAuthenticated, async (req, res) => { // Descomente para proteger a rota
  app.post(`${apiPrefix}/etiquetas`, async (req, res) => { // Mantenha assim para testar sem autenticação
    try {
      // Validar os dados recebidos com coerção de tipos
      const dadosValidados = etiquetaInsertSchema.parse(req.body); // Usando etiquetaInsertSchema

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
  // app.patch(`${apiPrefix}/etiquetas/:id`, isAuthenticated, async (req, res) => { // Descomente para proteger a rota
  app.patch(`${apiPrefix}/etiquetas/:id`, async (req, res) => { // Mantenha assim para testar sem autenticação
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      // Validar os dados recebidos com coerção de tipos (usando partial para permitir atualização parcial)
      const dadosValidados = etiquetaInsertSchema.partial().parse(req.body);

      // Remover o campo dataCriacao se presente, para não sobrescrever a data de criação original
      const { dataCriacao, ...dadosParaAtualizar } = dadosValidados;

      // Se não houver dados para atualizar após a validação parcial, retorne erro
      if (Object.keys(dadosParaAtualizar).length === 0) {
        return res.status(400).json({ message: "Nenhum dado válido fornecido para atualização" });
      }

      // Atualizar no banco de dados
      const [etiquetaAtualizada] = await db.update(etiquetas)
        .set(dadosParaAtualizar)
        .where(eq(etiquetas.id, id))
        .returning();

      if (!etiquetaAtualizada) {
        return res.status(404).json({ message: "Etiqueta não encontrada para atualização" });
      }

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
  // app.delete(`${apiPrefix}/etiquetas/:id`, isAuthenticated, async (req, res) => { // Descomente para proteger a rota
  app.delete(`${apiPrefix}/etiquetas/:id`, async (req, res) => { // Mantenha assim para testar sem autenticação
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      // Excluir do banco de dados (o Drizzle retorna os itens excluídos, então podemos verificar se algo foi excluído)
      const [deletedEtiqueta] = await db.delete(etiquetas)
        .where(eq(etiquetas.id, id))
        .returning({ id: etiquetas.id }); // Retorna o ID do item excluído para confirmação

      if (!deletedEtiqueta) {
        return res.status(404).json({ message: "Etiqueta não encontrada para exclusão" });
      }

      return res.json({ message: "Etiqueta excluída com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir etiqueta:", error);
      return res.status(500).json({ message: "Erro ao excluir etiqueta" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}