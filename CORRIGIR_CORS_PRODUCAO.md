# Como Corrigir o Erro de CORS no Render.com

Se você está vendo erros de CORS na versão de produção do site hospedado no Render.com, siga estas instruções para resolver o problema.

## Problema

O erro CORS ocorre porque o frontend e o backend estão em domínios diferentes (por exemplo, frontend em `doces-mara.onrender.com` e backend em `seu-backend-futuro.onrender.com`).

## Solução

### 1. Faça o deploy do backend no Render.com

1. Crie um novo serviço Web no Render.com
2. Conecte ao repositório GitHub
3. Configure o build como:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Adicione a variável de ambiente `NODE_ENV=production`
5. Anote a URL do backend gerada pelo Render.com (ex: `seu-backend-real.onrender.com`)

### 2. Edite o arquivo de configuração de produção

Abra o arquivo `client/.env.production` e substitua a URL do backend:

```
VITE_API_URL=https://seu-backend-real.onrender.com
```

Substitua `seu-backend-real.onrender.com` pela URL real do seu serviço backend no Render.com.

### 3. Faça o deploy do frontend no Render.com

1. Crie um novo serviço Static Site no Render.com
2. Conecte ao mesmo repositório GitHub
3. Configure o build como:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Anote a URL do frontend gerada pelo Render.com

### 4. Depois de fazer o deploy do frontend e backend

1. Acesse o dashboard do Render.com
2. Vá para o serviço de backend
3. Acesse a aba Environment
4. Adicione as variáveis de ambiente:
   - `CORS_ORIGIN=https://sua-url-frontend.onrender.com` (substitua pela URL real do frontend)
   - `DATABASE_URL=postgres://...` (sua URL do banco de dados)

5. Reinicie o serviço de backend depois de adicionar as variáveis

### 5. Teste o site novamente

Agora acesse seu site através da URL do frontend no Render.com. O erro de CORS deve estar resolvido.

## Se o erro persistir

Se você ainda estiver vendo erros de CORS:

1. Verifique se atualizou corretamente o arquivo `client/.env.production` com a URL exata do backend
2. Confira se adicionou a variável `CORS_ORIGIN` no backend com a URL exata do frontend
3. Certifique-se de que reiniciou o serviço de backend após as alterações
4. Limpe o cache do navegador ou teste em uma janela anônima/privativa

## Precisa de ajuda adicional?

Entre em contato com o desenvolvedor (Francisco Everton Rabelo) através do Instagram @evertonrb para suporte.