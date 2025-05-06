import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { etiquetas, etiquetaInsertSchema, etiquetaValidationSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = '/api';
  
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
      // Validar os dados recebidos
      const dadosValidados = etiquetaInsertSchema.parse(req.body);
      
      // Inserir no banco de dados
      const [novaEtiqueta] = await db.insert(etiquetas)
        .values(dadosValidados)
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
      
      // Validar os dados recebidos
      const dadosValidados = etiquetaInsertSchema.parse(req.body);
      
      // Atualizar no banco de dados
      const [etiquetaAtualizada] = await db.update(etiquetas)
        .set(dadosValidados)
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
