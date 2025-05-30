import { Pool } from 'pg'; // Importa o Pool do pacote 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'; // Altera para o driver do Drizzle para node-postgres
import * as schema from "../shared/schema"; // Mantém a importação do seu schema

// Carrega as variáveis de ambiente do .env. É bom garantir que isso aconteça aqui.
// Embora o 'tsx' geralmente faça isso automaticamente com 'dotenv/config',
// é uma boa prática ter uma importação explícita se o seu projeto não a tiver globalmente.
import 'dotenv/config'; 

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Cria uma nova instância do Pool do pg, usando a string de conexão do ambiente
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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