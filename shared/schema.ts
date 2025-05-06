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
  porcao: text('porcao').notNull(),
  unidadePorcao: text('unidade_porcao').notNull().default('g'),
  valorEnergetico: text('valor_energetico').notNull(),
  unidadeEnergetico: text('unidade_energetico').notNull().default('kcal'),
  carboidratos: text('carboidratos').notNull(),
  acucares: text('acucares').notNull(),
  proteinas: text('proteinas').notNull(),
  gordurasTotais: text('gorduras_totais').notNull(),
  gordurasSaturadas: text('gorduras_saturadas').notNull(),
  sodio: text('sodio').notNull(),
  fibras: text('fibras').notNull(),
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
  porcao: z.string().min(1, "Informe a porção"),
  unidadePorcao: z.string(),
  valorEnergetico: z.string().min(1, "Informe o valor energético"),
  unidadeEnergetico: z.string(),
  carboidratos: z.string().min(1, "Informe os carboidratos"),
  acucares: z.string().min(1, "Informe os açúcares"),
  proteinas: z.string().min(1, "Informe as proteínas"),
  gordurasTotais: z.string().min(1, "Informe as gorduras totais"),
  gordurasSaturadas: z.string().min(1, "Informe as gorduras saturadas"),
  sodio: z.string().min(1, "Informe o sódio"),
  fibras: z.string().min(1, "Informe as fibras"),
  nutrientesAdicionais: z.any().optional(),
  dataCriacao: z.date().optional()
});

// Tipos para uso no frontend
export type EtiquetaInsert = z.infer<typeof etiquetaInsertSchema>;
export type Etiqueta = z.infer<typeof etiquetaSelectSchema>;
