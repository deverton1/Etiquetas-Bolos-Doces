# Guia de Implantação no Netlify

Este documento explica como implantar o sistema de etiquetas no Netlify (frontend) e em outros serviços para o backend.

## Visão Geral da Arquitetura

Para hospedar gratuitamente, dividiremos o projeto em:

1. **Frontend (Netlify - Gratuito)**: Interface de usuário React
2. **Backend (Render/Railway - Plano Gratuito ou Econômico)**: API Express
3. **Banco de Dados (Neon/ElephantSQL - Plano Gratuito)**: PostgreSQL

## 1. Configuração do Banco de Dados

### Usando o Neon (PostgreSQL gratuito na nuvem)

1. Crie uma conta em [neon.tech](https://neon.tech)
2. Crie um novo projeto
3. Anote a string de conexão (será algo como `postgres://user:password@endpoint/neondb`)
4. Essa string será usada como a variável de ambiente `DATABASE_URL` no seu servidor backend

## 2. Configuração do Backend

### Usando o Render (plano gratuito)

1. Crie uma conta em [render.com](https://render.com)
2. Vincule com seu repositório GitHub
3. Crie um novo "Web Service"
4. Configure as seguintes opções:
   - **Build Command**: `npm install && npm run db:push`
   - **Start Command**: `npm run start`
   - **Variáveis de ambiente**:
     - `DATABASE_URL`: A string de conexão do Neon
     - `NODE_ENV`: production
     - `PORT`: 10000
5. Implante o serviço
6. Anote a URL do seu backend (será algo como `https://etiquetas-docesmara.onrender.com`)

## 3. Preparação do Frontend para Netlify

1. Crie um arquivo `.env.production` na raiz do projeto com:
   ```
   VITE_API_URL=https://etiquetas-docesmara.onrender.com
   ```
   (Use a URL do seu backend que você anotou no passo anterior)

2. Prepare o frontend para build:
   ```bash
   # Na raiz do projeto
   npm run build
   ```

3. Verifique se gerou uma pasta `dist` com os arquivos do frontend

## 4. Implantação no Netlify

### Usando a Interface Web

1. Crie uma conta no [Netlify](https://netlify.com)
2. Após o login, clique em "Add new site" → "Import an existing project"
3. Conecte com seu repositório GitHub
4. Configure as opções de build:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Clique em "Deploy site"

### Usando o Netlify CLI (alternativa)

1. Instale a CLI do Netlify:
   ```bash
   npm install -g netlify-cli
   ```

2. Autentique-se:
   ```bash
   netlify login
   ```

3. Inicialize o projeto:
   ```bash
   netlify init
   ```

4. Siga as instruções da CLI para configurar o projeto

## 5. Configuração de Domínio Personalizado (Opcional)

1. No painel do Netlify, vá para "Site settings" → "Domain management"
2. Clique em "Add custom domain"
3. Siga as instruções para configurar seu domínio personalizado

## 6. Atualizações e Manutenção

### Para atualizar o frontend:

1. Faça suas alterações no código
2. Faça commit e push para o repositório GitHub
3. O Netlify detectará automaticamente as mudanças e implantará a nova versão

### Para atualizar o backend:

1. Faça suas alterações no código
2. Faça commit e push para o repositório GitHub
3. O Render detectará automaticamente as mudanças e implantará a nova versão

## Notas importantes

- O plano gratuito do Render "adormece" após 15 minutos de inatividade, o que pode causar um atraso no primeiro acesso
- Para evitar esse comportamento, você pode atualizar para o plano pago mais básico (cerca de $7/mês)
- O plano gratuito do Neon tem limitações de armazenamento e conexões, mas é suficiente para projetos pequenos
- No Netlify, o limite gratuito é de 100GB de banda/mês, o que é mais do que suficiente para a maioria dos pequenos sites

## Solução de Problemas

### O frontend não consegue se conectar ao backend

- Verifique se a variável `VITE_API_URL` está configurada corretamente
- Verifique se o backend está em execução
- Verifique as configurações CORS no backend

### Erro ao acessar o banco de dados

- Verifique se a string de conexão `DATABASE_URL` está correta
- Verifique se as tabelas foram criadas corretamente com `npm run db:push`