// C:\Users\evert\Desktop\Etiqueta-Bolos-Doces-Backend\db\index.ts

import { Pool } from 'pg'; // <--- Usando o Pool do 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'; // <--- Driver do Drizzle para node-postgres
import * as schema from "../shared/schema";
import 'dotenv/config'; 

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Configuração para usar SSL/TLS em produção para o Pool do pg
export const pool = new Pool({ // <--- Cria o Pool do 'pg'
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

(async () => {
  try {
    await pool.query(`
      DO $$ 
      BEGIN
          ALTER TABLE "etiquetas" ADD COLUMN "dias_validade" integer DEFAULT 5 NOT NULL;
      EXCEPTION
          WHEN duplicate_column THEN 
              RAISE NOTICE 'A coluna "dias_validade" já existe na tabela "etiquetas".';
      END $$;
    `);
    console.log('DB MIGRATION: Coluna "dias_validade" verificada/criada com sucesso!');
  } catch (err) {
    console.error('DB MIGRATION ERROR: Falha ao verificar/criar coluna "dias_validade":', err);
    // Não travar o processo se for erro na migração
  }
})();

export const db = drizzle(pool, { schema }); // Drizzle com o Pool do 'pg'

// Listeners para o Pool do pg
pool.on('error', (err) => {
  console.error('Erro inesperado no pool do banco de dados:', err);
  process.exit(-1);
});

pool.connect() // <--- Método connect() do Pool do pg
  .then(client => { // client é um cliente obtido do pool
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    client.release(); // Libera o cliente de volta para o pool
  })
  .catch(err => {
    console.error('Falha ao conectar ao banco de dados na inicialização:', err);
  });