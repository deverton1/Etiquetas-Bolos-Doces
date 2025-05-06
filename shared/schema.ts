import { pgTable, text, serial, timestamp, integer, decimal, json } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Tabela de etiquetas para bolos
export const etiquetas = pgTable('etiquetas', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  descricao: text('descricao').notNull(),
  dataFabricacao: text('data_fabricacao').notNull(),
  dataValidade: text('data_validade').notNull(),
  porcao: decimal('porcao', { precision: 10, scale: 2 }).notNull(),
  unidadePorcao: text('unidade_porcao').notNull().default('g'),
  valorEnergetico: decimal('valor_energetico', { precision: 10, scale: 2 }).notNull(),
  unidadeEnergetico: text('unidade_energetico').notNull().default('kcal'),
  carboidratos: decimal('carboidratos', { precision: 10, scale: 2 }).notNull(),
  acucares: decimal('acucares', { precision: 10, scale: 2 }).notNull(),
  proteinas: decimal('proteinas', { precision: 10, scale: 2 }).notNull(),
  gordurasTotais: decimal('gorduras_totais', { precision: 10, scale: 2 }).notNull(),
  gordurasSaturadas: decimal('gorduras_saturadas', { precision: 10, scale: 2 }).notNull(),
  sodio: decimal('sodio', { precision: 10, scale: 2 }).notNull(),
  fibras: decimal('fibras', { precision: 10, scale: 2 }).notNull(),
  nutrientesAdicionais: json('nutrientes_adicionais').$type<NutrienteAdicional[]>(),
  dataCriacao: timestamp('data_criacao').defaultNow().notNull()
});

// Tipo para nutriente adicional
export type NutrienteAdicional = {
  id?: number;
  nome: string;
  valor: number;
  unidade: string;
};

// Schemas para inserção e seleção
export const etiquetaInsertSchema = createInsertSchema(etiquetas);
export const etiquetaSelectSchema = createSelectSchema(etiquetas);

// Schema personalizado para validação com coerção de tipos
export const etiquetaValidationSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(5, "A descrição deve ter pelo menos 5 caracteres"),
  dataFabricacao: z.string().min(1, "Selecione a data de fabricação"),
  dataValidade: z.string().min(1, "Selecione a data de validade"),
  porcao: z.coerce.number().positive("Deve ser maior que zero"),
  unidadePorcao: z.string(),
  valorEnergetico: z.coerce.number().positive("Deve ser maior que zero"),
  unidadeEnergetico: z.string(),
  carboidratos: z.coerce.number().min(0, "Não pode ser negativo"),
  acucares: z.coerce.number().min(0, "Não pode ser negativo"),
  proteinas: z.coerce.number().min(0, "Não pode ser negativo"),
  gordurasTotais: z.coerce.number().min(0, "Não pode ser negativo"),
  gordurasSaturadas: z.coerce.number().min(0, "Não pode ser negativo"),
  sodio: z.coerce.number().min(0, "Não pode ser negativo"),
  fibras: z.coerce.number().min(0, "Não pode ser negativo"),
  nutrientesAdicionais: z.any().optional(),
  dataCriacao: z.date().optional()
});

// Tipos para uso no frontend
export type EtiquetaInsert = z.infer<typeof etiquetaInsertSchema>;
export type Etiqueta = z.infer<typeof etiquetaSelectSchema>;
