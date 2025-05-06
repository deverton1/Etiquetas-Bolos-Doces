# Sistema de Etiquetas Nutricionais - DOCES MARA

![DOCES MARA Logo](./logo.png)

## Descrição

Sistema completo para geração de etiquetas nutricionais para produtos da confeitaria DOCES MARA. A aplicação permite criar, editar, armazenar e imprimir etiquetas personalizadas com informações nutricionais, seguindo o padrão brasileiro de rotulagem.

## Funcionalidades

- ✅ Criação e edição de etiquetas nutricionais
- ✅ Visualização em tempo real das etiquetas
- ✅ Impressão em diferentes formatos (80mm, 58mm)
- ✅ Opção de impressão colorida ou preto e branco
- ✅ Atualização automática de datas de fabricação
- ✅ Cálculo automático de datas de validade
- ✅ Pesquisa de etiquetas por nome ou descrição
- ✅ Cadastro de nutrientes adicionais personalizados
- ✅ Interface responsiva para desktops e tablets

## Tecnologias Utilizadas

- **Frontend:** React, Tailwind CSS, shadcn/ui
- **Backend:** Express.js, Node.js
- **Banco de Dados:** PostgreSQL com Drizzle ORM
- **Gerenciamento de Estado:** TanStack Query
- **Validação:** Zod
- **Estilização:** Tailwind CSS, CSS customizado

## Documentação

A documentação completa do projeto está disponível nos seguintes arquivos:

- [Guia de Instalação](./GUIA_INSTALACAO.md): Instruções para instalar e configurar o projeto em ambiente local
- [Manual do Usuário](./MANUAL_USUARIO.md): Guia completo de todas as funcionalidades disponíveis no sistema
- [Guia para Transformação em APK](./GUIA_TRANSFORMACAO_APK.md): Informações sobre como converter o projeto em um aplicativo Android

## Requisitos

- Node.js 18.x ou superior
- npm 8.x ou superior
- PostgreSQL 14.x ou superior
- Navegador moderno (Chrome, Firefox, Edge)

## Instalação Rápida

1. Clone o repositório
2. Instale as dependências
   ```bash
   npm install
   ```
3. Configure o banco de dados PostgreSQL e crie um arquivo `.env` com:
   ```
   DATABASE_URL=postgres://usuario:senha@localhost:5432/docesmara
   ```
4. Execute as migrações do banco:
   ```bash
   npm run db:push
   ```
5. Inicie a aplicação:
   ```bash
   npm run dev
   ```

Para instruções detalhadas, consulte o [Guia de Instalação](./GUIA_INSTALACAO.md).

## Estrutura do Projeto

```
etiquetas-docesmara/
├── client/               # Código do frontend
│   ├── src/
│       ├── components/   # Componentes React
│       ├── hooks/        # Custom hooks
│       ├── lib/          # Bibliotecas e utilidades
│       ├── pages/        # Páginas da aplicação
├── server/               # Código do backend
├── db/                   # Configuração do banco de dados
├── shared/               # Schemas e tipos compartilhados
```

## Capturas de Tela

![Tela Principal](./screenshot1.png)
![Edição de Etiqueta](./screenshot2.png)
![Impressão de Etiqueta](./screenshot3.png)

## Impressão

O sistema suporta os seguintes formatos de impressão:

- **Padrão (80mm)**: Ideal para impressoras térmicas padrão de 80mm
- **Compacto (58mm)**: Para impressoras térmicas menores de 58mm
- **Modo PB**: Otimizado para impressão em preto e branco

## Desenvolvimento

Para contribuir com o projeto:

1. Crie um fork do repositório
2. Crie uma branch para sua feature
   ```bash
   git checkout -b minha-nova-feature
   ```
3. Faça seus commits
4. Envie para o repositório remoto
   ```bash
   git push origin minha-nova-feature
   ```
5. Crie um Pull Request

## Licença

Este projeto é proprietário e desenvolvido exclusivamente para a DOCES MARA. Todos os direitos reservados.

## Contato

Para mais informações, entre em contato com:

- Instagram: [@docesmaratatuape](https://instagram.com/docesmaratatuape)
- Telefone: (11) 9 7083-6151 / (11) 9 8148-2372
- Endereço: Rua Francisco Marengo 1735 - São Paulo - CEP 03313000