# Guia de Deploy Unificado no Render.com

Este guia simplificado mostra como fazer deploy da aplicação Etiquetas DOCES MARA no Render.com de forma unificada (backend e frontend juntos), eliminando problemas de CORS.

## Preparação

1. Certifique-se de que seu código está no GitHub e acessível
2. Tenha uma conta no [Render.com](https://render.com)
3. Crie um banco de dados PostgreSQL no Render.com ou use outro serviço

## 1. Criar o banco de dados (se não tiver um)

1. Acesse o dashboard do Render.com
2. Clique em "New" → "PostgreSQL"
3. Configure:
   - **Nome**: docesmara-db (ou outro nome)
   - **Database User**: docesmara
   - **Database**: docesmara
4. Após criação, salve a "External Database URL" - vamos precisar dela

## 2. Deploy Unificado da Aplicação

1. No dashboard do Render.com, clique em "New" → "Web Service"
2. Conecte ao seu repositório GitHub
3. Configure:
   - **Nome**: etiquetas-docesmara (ou nome de sua preferência)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. Na seção "Advanced" → "Environment Variables", adicione:
   - `DATABASE_URL`: Cole a URL do banco de dados PostgreSQL
   - `NODE_ENV`: production
   - `SESSION_SECRET`: Crie uma string aleatória e segura, ex: "fyw78e9fhw9e8fgw98f"
   - `PORT`: 10000 (ou outra porta de sua preferência)

5. Clique em "Create Web Service"

## 3. Inicializar o Banco de Dados

Após o primeiro deploy com sucesso:

1. No dashboard do Render.com, acesse a seção "Shell" do seu web service
2. Execute os seguintes comandos:
   ```
   npm run db:push
   npm run db:seed
   ```

Este processo vai criar as tabelas necessárias e adicionar dados iniciais.

## 4. Testar a Aplicação

1. Acesse a URL fornecida pelo Render.com para seu web service
2. Tente fazer login com:
   - Email: docesmara.admin@gmail.com
   - Senha: Mara1421

## Solução de Problemas

### Se o login falhar com erro 500:

1. Verifique os logs no Render.com, na aba "Logs" do seu serviço
2. Assegure-se de que o banco de dados está conectado corretamente:
   - Verifique a variável `DATABASE_URL`
   - Certifique-se de que as tabelas foram criadas com `npm run db:push`

### Se o site aparecer sem estilos ou imagens:

1. Verifique se o build foi concluído com sucesso
2. Reinicie o serviço pelo dashboard do Render.com

### Se a fonte BADHORSE não aparecer:

A aplicação está configurada para usar uma fonte alternativa (Abril Fatface) quando a BADHORSE não estiver disponível. Isso não afeta a funcionalidade.

## Manutenção

- Para atualizar a aplicação, basta fazer push para o branch principal do GitHub
- O Render.com detecta mudanças e faz deploy automaticamente
- Para verificar o status do deploy, acesse a aba "Events" no dashboard do Render.com

---

## Alterações Realizadas para Facilitar o Deploy

1. **Configuração de Sessão**: Otimizada para trabalhar em produção
2. **Configuração CORS**: Simplificada para permitir acesso de origens específicas
3. **Autenticação**: Melhorada para usar caminhos relativos, eliminando problemas de CORS
4. **Frontend/Backend**: Unificados para servir de um único domínio no Render.com

Siga este guia para um deploy simples e sem problemas de CORS.