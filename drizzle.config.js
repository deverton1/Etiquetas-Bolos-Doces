// C:\Users\evert\Desktop\EtiquetaDoceira\drizzle.config.js (NOVO CONTEÚDO EM COMMONJS)

// Mude de import para require para carregar dotenv
require('dotenv').config(); // Usar .config() explicitamente de dotenv

// Mude de import para require para drizzle-kit
const { defineConfig } = require("drizzle-kit");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

// Mude de export default para module.exports
module.exports = defineConfig({
  out: "./db/migrations",
  // O caminho do schema continua o mesmo, Drizzle-kit vai processar o .ts
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  // --strict false é uma flag de CLI, não vai aqui no config
});