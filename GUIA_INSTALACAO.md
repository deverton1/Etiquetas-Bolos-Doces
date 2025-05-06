# Guia de Instalação - Sistema de Etiquetas DOCES MARA

Este guia explica como instalar e configurar o Sistema de Geração de Etiquetas Nutricionais da DOCES MARA em um ambiente local.

## Requisitos de Sistema

- **Node.js** (versão 18.x ou superior)
- **npm** (normalmente vem com o Node.js)
- **PostgreSQL** (versão 14.x ou superior)
- **Navegador moderno** (Chrome, Firefox, Edge)

## 1. Instalação do Node.js e npm

### Windows
1. Acesse [nodejs.org](https://nodejs.org/)
2. Baixe a versão LTS (Long Term Support)
3. Execute o instalador e siga as instruções

### macOS
1. Instale o Homebrew (se ainda não tiver):
   ```
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. Instale o Node.js:
   ```
   brew install node
   ```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install nodejs npm
```

## 2. Instalação do PostgreSQL

### Windows
1. Baixe o instalador em [postgresql.org](https://www.postgresql.org/download/windows/)
2. Execute o instalador e siga as instruções
3. Anote a senha do usuário postgres definida durante a instalação

### macOS
```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

## 3. Configuração do Banco de Dados

1. Acesse o PostgreSQL:
   ```bash
   # Windows: Use o pgAdmin instalado com o PostgreSQL
   # macOS/Linux:
   sudo -u postgres psql
   ```

2. Crie um banco de dados para a aplicação:
   ```sql
   CREATE DATABASE docesmara;
   CREATE USER docesmara WITH ENCRYPTED PASSWORD 'suasenha';
   GRANT ALL PRIVILEGES ON DATABASE docesmara TO docesmara;
   \q
   ```

## 4. Configuração do Projeto

1. Clone o repositório:
   ```bash
   git clone https://github.com/seurepositorio/etiquetas-docesmara.git
   cd etiquetas-docesmara
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie um arquivo `.env` na raiz do projeto:
   ```
   DATABASE_URL=postgres://docesmara:suasenha@localhost:5432/docesmara
   ```

4. Execute a migração do banco de dados:
   ```bash
   npm run db:push
   ```

5. (Opcional) Execute o seed para criar dados iniciais:
   ```bash
   npm run db:seed
   ```

## 5. Iniciar a Aplicação

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 6. Configuração da Impressora

O sistema está configurado para funcionar com impressoras térmicas comuns, mas é recomendado seguir estas orientações:

1. Instale os drivers da impressora no computador
2. Certifique-se de que a impressora está definida como padrão
3. No sistema, escolha o tamanho correto para sua impressora:
   - 80mm para impressoras térmicas padrão
   - 58mm para impressoras térmicas menores

### Dicas para impressão

- Recomendamos usar o navegador Chrome para melhor compatibilidade
- Ao imprimir, escolha "Sem margens" nas opções de impressão
- Desative cabeçalhos e rodapés nas configurações de impressão
- Caso prefira, use o modo Preto e Branco para economizar tinta

## Solução de Problemas

### O banco de dados não conecta
- Verifique se o PostgreSQL está rodando
- Confirme se as credenciais no arquivo `.env` estão corretas

### Problemas na impressão
- Certifique-se de que a impressora está conectada e é a impressora padrão
- Verifique se escolheu o tamanho correto no sistema
- Ajuste as configurações de impressão do navegador

### Erro ao iniciar a aplicação
- Verifique se todas as dependências foram instaladas corretamente
- Confirme se está usando uma versão compatível do Node.js

## Contato para Suporte

Para suporte técnico, entre em contato com:
- Email: suporte@suaempresa.com
- Telefone: (XX) XXXX-XXXX