import { pgTable, text, serial, timestamp, integer, decimal, json, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Tabela de etiquetas para bolos
export const etiquetas = pgTable('etiquetas', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  descricao: text('descricao').notNull(),
  dataFabricacao: text('data_fabricacao').notNull(),
  dataValidade: text('data_validade').notNull(),
  diasValidade: integer('dias_validade').notNull().default(5),
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
  // O $type é importante aqui, ele diz ao Drizzle que este JSON é um array de NutrienteAdicional
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

// **NOVA DEFINIÇÃO DO SCHEMA ZOD PARA NutrienteAdicional**
export const nutrienteAdicionalSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(1, "O nome do nutriente é obrigatório"),
  valor: z.number().min(0, "O valor do nutriente deve ser um número não negativo"),
  unidade: z.string().min(1, "A unidade do nutriente é obrigatória"),
});


// Schemas para inserção e seleção (Drizzle-Zod inferirá os tipos corretamente agora)
export const etiquetaInsertSchema = createInsertSchema(etiquetas, {
  // Sobrescrever a validação de `nutrientesAdicionais` do Drizzle-Zod
  // para usar o schema Zod definido manualmente.
  nutrientesAdicionais: z.array(nutrienteAdicionalSchema).optional().nullable(),
  dataCriacao: z.date().optional(), // para permitir que a data de criação seja opcional na inserção
  diasValidade: z.number().int().min(1, "Dias de validade inválidos").default(5)
});

export const etiquetaSelectSchema = createSelectSchema(etiquetas);

// Schema personalizado para validação com coerção de tipos
// Sugestão: A menos que haja um motivo forte, alinhe este schema com o etiquetaInsertSchema ou selectSchema
// Se você realmente precisa de um schema de validação separado, use-o com cuidado.
export const etiquetaValidationSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(5, "A descrição deve ter pelo menos 5 caracteres"),
  dataFabricacao: z.string().min(1, "Selecione a data de fabricação"),
  dataValidade: z.string().min(1, "Selecione a data de validade"),
  diasValidade: z.number().int().min(1, "Dias de validade inválidos").default(5),
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
  // **CORREÇÃO AQUI:** Definir como um array de nutrienteAdicionalSchema
  nutrientesAdicionais: z.array(nutrienteAdicionalSchema).optional().nullable(), // Aceita array de NutrienteAdicional ou null/undefined
  dataCriacao: z.date().optional()
});

// Tabela de usuários para autenticação
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  isAdmin: boolean('is_admin').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Schemas para inserção e seleção de usuários
export const userInsertSchema = createInsertSchema(users);
export const userSelectSchema = createSelectSchema(users);

// Schema de validação de login
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
});

// Tipos para uso no frontend
export type EtiquetaInsert = z.infer<typeof etiquetaInsertSchema>;
export type Etiqueta = z.infer<typeof etiquetaSelectSchema>;
export type UserInsert = z.infer<typeof userInsertSchema>;
export type User = z.infer<typeof userSelectSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;