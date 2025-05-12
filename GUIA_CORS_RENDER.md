# Guia para Resolver Problemas de CORS no Render.com

Este guia explica como resolver os problemas de CORS ao hospedar o frontend e backend da aplicação de Etiquetas DOCES MARA em domínios diferentes no Render.com.

## O que é CORS e por que é um problema?

O CORS (Cross-Origin Resource Sharing) é um mecanismo de segurança do navegador que impede requisições entre diferentes domínios. Quando você tem o frontend em um domínio (ex: `doces-mara.onrender.com`) e o backend em outro (ex: `seu-backend-real.onrender.com`), o navegador bloqueia estas requisições por padrão.

## Solução 1: Configuração de proxy no Netlify (Recomendada)

Esta solução utiliza um proxy no Netlify para redirecionar as chamadas de API, evitando problemas de CORS.

### Passo 1: Atualizar o arquivo `netlify.toml`

```toml
[build]
  base = "/"
  publish = "dist"
  command = "npm run build"

# Proxy para as chamadas de API em produção
# IMPORTANTE: Substitua 'seu-backend-real.onrender.com' pela URL real do seu backend no Render
[[redirects]]
  from = "/api/*"
  to = "https://seu-backend-real.onrender.com/api/:splat"
  status = 200
  force = true
  headers = {Access-Control-Allow-Origin = "*", Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, PATCH, OPTIONS", Access-Control-Allow-Headers = "Origin, X-Requested-With, Content-Type, Accept, Authorization"}

# Para requisições OPTIONS (preflight CORS)
[[redirects]]
  from = "/api/*"
  to = "https://seu-backend-real.onrender.com/api/:splat"
  status = 204
  force = true
  methods = ["OPTIONS"]
  headers = {Access-Control-Allow-Origin = "*", Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, PATCH, OPTIONS", Access-Control-Allow-Headers = "Origin, X-Requested-With, Content-Type, Accept, Authorization"}

# Redirecionamento para SPA (Single Page Application)
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Passo 2: Atualizar o hook de autenticação para usar caminhos relativos

No arquivo `client/src/hooks/use-auth.tsx`, modifique o código para usar caminhos relativos em produção:

```typescript
// Em produção, use caminhos relativos para evitar CORS
// Em desenvolvimento, use a URL da API configurada
const isProduction = import.meta.env.PROD;
const apiUrl = isProduction ? '' : (import.meta.env.VITE_API_URL || '');
```

### Passo 3: Fazer o deploy no Netlify

1. Faça o commit de todas as alterações
2. Faça o deploy no Netlify
3. Verifique se o site está funcionando corretamente

## Solução 2: Configuração CORS no Backend (Render.com)

Se preferir, você também pode configurar o CORS diretamente no servidor backend.

### Passo 1: Atualizar a configuração CORS no arquivo `server/index.ts`

```typescript
// Configuração CORS mais robusta
app.use(
  cors({
    // Em produção, aceita apenas as origens específicas
    // Em desenvolvimento, aceita qualquer origem
    origin: (origin, callback) => {
      const allowedOrigins = [
        "https://doces-mara.onrender.com",
        "https://doces-mara.netlify.app",
        // Adicione outros domínios se necessário
      ];
      
      // Permite requisições sem Origin (como mobile apps ou Postman)
      if (!origin) return callback(null, true);
      
      // Em desenvolvimento, aceita qualquer origem
      if (process.env.NODE_ENV !== "production") return callback(null, true);
      
      // Em produção, verifica se a origem está na lista de permitidas
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        return callback(new Error('Não permitido por CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
```

### Passo 2: Atualizar o arquivo `.env.production` do cliente

```
# Substitua pela URL real do seu backend no Render
VITE_API_URL=https://seu-backend-real.onrender.com
```

### Passo 3: Fazer o deploy do backend e frontend

1. Faça o commit de todas as alterações
2. Faça o deploy tanto do backend quanto do frontend
3. Verifique se o site está funcionando corretamente

## Solução 3: Usar Domínio Personalizado

Se você tiver um domínio personalizado, pode configurar subdomínios para o frontend e backend (por exemplo, `app.seudominio.com` e `api.seudominio.com`), o que pode facilitar a configuração de CORS.

## Resolução de Problemas

### Ainda estou tendo problemas de CORS

1. Verifique se atualizou as URLs corretas nos arquivos de configuração
2. Certifique-se de que os cabeçalhos CORS estão sendo enviados corretamente
3. Analise os logs do backend para ver se há algum erro
4. Utilize as ferramentas de desenvolvedor do navegador (F12) para identificar o problema específico

### A fonte BADHORSE não está carregando

Para garantir que a fonte BADHORSE seja carregada corretamente:

1. Verifique se o CDN foi adicionado ao `index.html`:
   ```html
   <link href="https://fonts.cdnfonts.com/css/badhorse" rel="stylesheet" />
   ```

2. Certifique-se de que a importação está no início do arquivo CSS:
   ```css
   @import url('https://fonts.cdnfonts.com/css/badhorse');
   ```

### Sessões não estão persistindo

Certifique-se de que:

1. As requisições estão sendo feitas com a opção `credentials: 'include'`
2. O backend está configurado para aceitar cookies de outros domínios
3. O banco de dados para armazenar sessões está funcionando corretamente

## Contato para Suporte

Se você continuar tendo problemas após seguir este guia, entre em contato com o desenvolvedor:

- Francisco Everton Rabelo
- Instagram: @evertonrb

---

Última atualização: Maio 2023