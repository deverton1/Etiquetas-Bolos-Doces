import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Para garantir que __dirname esteja disponível em ES Modules para o Vite
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // ADICIONAR A CONFIGURAÇÃO DE PROXY AQUI
  server: {
    // Isso garante que o Vite use 'localhost' por padrão
    // host: 'localhost', // Se precisar forçar localhost, mas 0.0.0.0 é bom para acesso externo
    port: 5173, // Confirme a porta do frontend (geralmente 5173)
    proxy: {
      '/api': { // Qualquer requisição que comece com /api
        target: 'http://localhost:5000', // Será redirecionada para o backend na porta 5000
        changeOrigin: true, // Necessário para mudar o cabeçalho 'Origin'
        secure: false, // Se o backend não estiver em HTTPS (comum em dev)
        ws: true, // Habilita proxy para WebSockets se seu backend usar (ex: para autenticação de sessão)
        // rewrite: (path) => path.replace(/^\/api/, '') // Opcional: Se o backend não tiver /api no início das suas rotas (mas o seu tem)
      },
    },
  },
});