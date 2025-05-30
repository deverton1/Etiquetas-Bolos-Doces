/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string; // Exemplo de variável, adicione as suas
  // Adicione aqui as variáveis de ambiente que você usa com VITE_
  readonly VITE_API_URL: string; // Exemplo para a URL da API
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}