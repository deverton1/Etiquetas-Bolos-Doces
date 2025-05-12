# Instruções para Deploy no Render.com

Este documento contém instruções detalhadas para fazer o deploy do Sistema de Etiquetas DOCES MARA no Render.com e resolver problemas comuns.

## 1. Deploy do Backend

### Criar o serviço Web

1. Acesse o [Dashboard do Render](https://dashboard.render.com/)
2. Clique em "New" e selecione "Web Service"
3. Conecte ao repositório GitHub ou escolha "Manual Deploy"
4. Configure o build:
   - **Nome**: backend-etiquetas-docesmara (ou nome de sua preferência)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/server/index.js`

### Configurar variáveis de ambiente

Na seção "Environment" do seu serviço, adicione:

```
NODE_ENV=production
DATABASE_URL=postgres://... (URL do seu banco PostgreSQL)
SESSION_SECRET=chave-secreta-docesmara (crie uma chave forte)
```

## 2. Deploy do Frontend

### Criar o serviço Web

1. Acesse o [Dashboard do Render](https://dashboard.render.com/)
2. Clique em "New" e selecione "Web Service"
3. Conecte ao repositório GitHub ou escolha "Manual Deploy"
4. Configure o build:
   - **Nome**: frontend-etiquetas-docesmara (ou nome de sua preferência)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/server/index.js`

### Configurar variáveis de ambiente

Na seção "Environment" do seu serviço frontend, adicione:

```
NODE_ENV=production
VITE_API_URL=https://URL-DO-SEU-BACKEND.onrender.com
```

Substitua "URL-DO-SEU-BACKEND" pela URL real do seu serviço de backend no Render.

## 3. Configurar o Banco de Dados

Para o sistema funcionar, você precisará de um banco de dados PostgreSQL.

### Opção 1: Usar o PostgreSQL do Render

1. Acesse o [Dashboard do Render](https://dashboard.render.com/)
2. Clique em "New" e selecione "PostgreSQL"
3. Configure o banco de dados:
   - **Nome**: docesmara-db (ou nome de sua preferência)
   - **Database**: docesmara
   - **User**: docesmara
4. Clique em "Create Database"
5. Após a criação, copie a "Internal Database URL" e a "External Database URL"
6. Use a URL externa como valor para a variável `DATABASE_URL` no backend

### Opção 2: Usar outro provedor PostgreSQL

Se você já tem um banco de dados PostgreSQL (ex: Neon, Supabase, etc.):

1. Obtenha a string de conexão do seu provedor
2. Use-a como valor para a variável `DATABASE_URL` no backend

## 4. Resolver Problemas Comuns

### Erro de CORS

Se estiver tendo erros de CORS:

1. Verifique se a URL do backend em `.env.production` está exatamente igual à URL do seu serviço de backend no Render
2. No backend, adicione a variável de ambiente:
   ```
   CORS_ORIGIN=https://URL-DO-SEU-FRONTEND.onrender.com
   ```
   Substitua pela URL exata do seu frontend
3. Reinicie ambos os serviços

### Erro 500 no Login

Se estiver tendo erro 500 ao tentar fazer login:

1. Verifique se a variável `DATABASE_URL` está corretamente configurada no backend
2. Certifique-se de que o banco de dados está acessível a partir do serviço backend
3. Adicione ou atualize a variável de ambiente `SESSION_SECRET` no backend
4. Verifique os logs do backend no dashboard do Render para identificar o problema específico

### Problemas com Cookie de Sessão

Se o login parece funcionar, mas você não permanece logado:

1. No backend, verifique se adicionou a variável `NODE_ENV=production`
2. Verifique se o frontend e backend estão na mesma região do Render

### Fonte BADHORSE não carrega

Se estiver tendo problemas com a fonte BADHORSE:

1. O sistema já inclui uma fonte alternativa (Abril Fatface) que será usada quando a BADHORSE falhar
2. A substituição é automática e não deve afetar a funcionalidade do sistema

## 5. Inicialização do Banco de Dados

Após o primeiro deploy, você precisa inicializar o banco de dados:

1. No dashboard do Render, acesse o shell do serviço de backend
2. Execute os comandos:
   ```
   npm run db:push
   npm run db:seed
   ```

## 6. Verificando o Deploy

Para verificar se o sistema está funcionando corretamente:

1. Acesse a URL do frontend
2. Tente fazer login com:
   - Email: docesmara.admin@gmail.com
   - Senha: Mara1421
3. Deve ser possível acessar a área de criação e gerenciamento de etiquetas

## 7. Solução de Problemas Avançados

Se você continuar enfrentando problemas, consulte os logs de ambos os serviços no dashboard do Render. A maioria dos problemas pode ser identificada através dos logs.

Para ajuda adicional, contate o desenvolvedor através do Instagram @evertonrb.