// C:\Users\evert\Desktop\EtiquetaDoceira\db\index.ts

import { Pool } from 'pg'; // Importa o Pool do pacote 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'; // Altera para o driver do Drizzle para node-postgres
import * as schema from "../shared/schema"; // Mantém a importação do seu schema
import 'dotenv/config'; // Carrega as variáveis de ambiente

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configuração para usar SSL/TLS em produção
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // 'rejectUnauthorized: false' é frequentemente usado em ambientes de desenvolvimento ou para provedores
  // que usam certificados autoassinados. Em produção real com certificados válidos,
  // você pode querer remover 'rejectUnauthorized: false' ou configurá-lo para 'true'
  // se você tiver o certificado CA do seu provedor de DB.
  // No Render, 'rejectUnauthorized: false' geralmente funciona bem com muitos provedores de DB.
});

// Inicializa o Drizzle com o cliente Pool do pg
export const db = drizzle(pool, { schema });

// Opcional: Adicionar um listener para verificar a conexão
pool.on('error', (err) => {
  console.error('Erro inesperado no pool do banco de dados:', err);
  process.exit(-1); // Encerrar a aplicação em caso de erro grave de conexão
});

// Opcional: Adicionar um log para confirmar a conexão (pode ser útil no desenvolvimento)
pool.connect()
  .then(client => {
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    client.release(); // Libera o cliente de volta para o pool
  })
  .catch(err => {
    console.error('Falha ao conectar ao banco de dados na inicialização:', err);
  });