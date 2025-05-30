import { db } from "./index";
import * as schema from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("Iniciando seed do banco de dados...");
    
    // Verificar se já existe o usuário administrador
    const userAdmin = await db.query.users.findFirst({
      where: (users) => eq(users.email, "docesmara.admin@gmail.com")
    });
    
    if (!userAdmin) {
      // Criar o usuário administrador
      const hashedPassword = await bcrypt.hash("Mara1421", 10);
      await db.insert(schema.users).values({
        email: "docesmara.admin@gmail.com",
        password: hashedPassword,
        isAdmin: true
      });
      console.log("Usuário administrador criado com sucesso!");
    } else {
      console.log("Usuário administrador já existe, pulando criação.");
    }
    
    // Verificar se já existem etiquetas no banco de dados
    const etiquetasExistentes = await db.query.etiquetas.findMany();
    
    if (etiquetasExistentes.length > 0) {
      console.log(`Já existem ${etiquetasExistentes.length} etiquetas no banco. Pulando seed.`);
      return;
    }
    
    // Criar etiquetas iniciais de exemplo
    const etiquetasIniciais = [
      {
        nome: "Bolo de Chocolate",
        descricao: "Delicioso bolo de chocolate com recheio de brigadeiro e cobertura de ganache",
        dataFabricacao: new Date().toISOString().split('T')[0],
        dataValidade: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0],
        porcao: "100",
        unidadePorcao: "g",
        valorEnergetico: "320",
        unidadeEnergetico: "kcal",
        carboidratos: "42",
        acucares: "28",
        proteinas: "5",
        gordurasTotais: "15",
        gordurasSaturadas: "8",
        sodio: "150",
        fibras: "1.8",
        nutrientesAdicionais: [
          {
            nome: "Cálcio",
            valor: 120,
            unidade: "mg"
          }
        ]
      },
      {
        nome: "Bolo de Cenoura",
        descricao: "Bolo de cenoura tradicional com cobertura de chocolate",
        dataFabricacao: new Date().toISOString().split('T')[0],
        dataValidade: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0],
        porcao: "100",
        unidadePorcao: "g",
        valorEnergetico: "280",
        unidadeEnergetico: "kcal",
        carboidratos: "38",
        acucares: "24",
        proteinas: "4.5",
        gordurasTotais: "12",
        gordurasSaturadas: "5.5",
        sodio: "130",
        fibras: "2.2",
        nutrientesAdicionais: [
          {
            nome: "Vitamina A",
            valor: 320,
            unidade: "µg"
          }
        ]
      },
      {
        nome: "Bolo de Morango",
        descricao: "Bolo branco com recheio e cobertura de morangos frescos",
        dataFabricacao: new Date().toISOString().split('T')[0],
        dataValidade: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString().split('T')[0],
        porcao: "100",
        unidadePorcao: "g",
        valorEnergetico: "260",
        unidadeEnergetico: "kcal",
        carboidratos: "35",
        acucares: "20",
        proteinas: "4.2",
        gordurasTotais: "11",
        gordurasSaturadas: "5",
        sodio: "120",
        fibras: "1.5",
        nutrientesAdicionais: [
          {
            nome: "Vitamina C",
            valor: 28,
            unidade: "mg"
          }
        ]
      }
    ];
    
    // Inserir etiquetas no banco de dados
    await db.insert(schema.etiquetas).values(etiquetasIniciais);
    
    console.log(`${etiquetasIniciais.length} etiquetas foram inseridas com sucesso!`);
  } catch (error) {
    console.error("Erro ao executar seed:", error);
  }
}

seed();
