# 🏪 Sistema PDV Gesso Primus

Sistema completo de Ponto de Venda (PDV) desenvolvido com React, TypeScript e Tailwind CSS. Solução moderna para gestão de vendas, estoque, clientes e relatórios.

## 🚀 Funcionalidades

### 💰 PDV Moderno
- Interface intuitiva para vendas rápidas
- Busca por produtos e código de barras
- Carrinho dinâmico com cálculos automáticos
- Múltiplas formas de pagamento (PIX, Dinheiro, Cartão)
- Impressão de recibos
- Controle de estoque em tempo real

### 📊 Gestão Completa
- **Produtos**: Cadastro, edição, categorização
- **Estoque**: Controle avançado, alertas de baixo estoque
- **Clientes**: Gestão de relacionamento
- **Fornecedores**: Cadastro e controle
- **Relatórios**: Vendas por período, lucro, performance
- **Produção**: Controle de manufatura
- **Financeiro**: Receitas, despesas, retiradas

### 📱 Interface Responsiva
- Design moderno e profissional
- Otimizado para tablets e desktops
- Tema claro/escuro automático
- Experiência de usuário intuitiva

## 🛠️ Tecnologias

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Routing**: React Router DOM
- **Tests**: Vitest + Testing Library
- **Build**: Vite + TypeScript
- **Linting**: ESLint + Prettier

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Git

## 🚀 Instalação e Desenvolvimento

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd sistema-pdv-gesso-primus
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário:
```env
# Configurações do sistema
VITE_APP_NAME="Gesso Primus PDV"
VITE_APP_VERSION="1.0.0"

# Para integrações futuras (opcional)
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Execute em desenvolvimento
```bash
npm run dev
# ou
yarn dev
```

Acesse: `http://localhost:5173`

## 🧪 Testes

### Executar todos os testes
```bash
npm run test
# ou
yarn test
```

### Executar testes em modo watch
```bash
npm run test:watch
# ou
yarn test:watch
```

### Coverage dos testes
```bash
npm run test:coverage
# ou
yarn test:coverage
```

## 🏗️ Build e Produção

### Build para produção
```bash
npm run build
# ou
yarn build
```

### Preview da build
```bash
npm run preview
# ou
yarn preview
```

### Verificar a build
```bash
npm run build && npm run preview
```

## 🐳 Docker

### Desenvolvimento com Docker
```bash
# Build da imagem de desenvolvimento
docker build -f Dockerfile.dev -t pdv-dev .

# Execute o container
docker run -p 5173:5173 pdv-dev
```

### Produção com Docker
```bash
# Build da imagem de produção
docker build -t pdv-prod .

# Execute o container
docker run -p 80:80 pdv-prod
```

### Docker Compose
```bash
# Desenvolvimento
docker-compose up dev

# Produção
docker-compose up prod
```

## 🚀 Deploy

### Deploy automático (GitHub Actions)
1. Faça push para a branch `main`
2. O workflow automático fará deploy para Vercel
3. URL será disponibilizada nos logs do Actions

### Deploy manual no Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### Deploy manual no Netlify
```bash
# Build
npm run build

# Deploy pasta dist/ no Netlify
```

## 👥 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add some amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para mais detalhes.

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build

# Testes
npm run test         # Executar testes
npm run test:watch   # Testes em modo watch
npm run test:coverage # Coverage dos testes

# Linting e formatação
npm run lint         # Verificar linting
npm run lint:fix     # Corrigir linting automaticamente
npm run format       # Formatar código com Prettier
npm run format:check # Verificar formatação

# Outros
npm run type-check   # Verificar tipos TypeScript
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base (Shadcn)
│   ├── dashboard/      # Dashboard e estatísticas
│   ├── sales/          # PDV e vendas
│   ├── products/       # Gestão de produtos
│   ├── stock/          # Controle de estoque
│   ├── customers/      # Gestão de clientes
│   ├── reports/        # Relatórios
│   └── ...
├── contexts/           # Contextos React
├── hooks/              # Custom hooks
├── lib/                # Utilitários e configurações
├── pages/              # Páginas da aplicação
├── tests/              # Testes unitários
└── types/              # Definições TypeScript
```

## 🔒 Autenticação

O sistema inclui autenticação básica. Para desenvolvimento:
- Usuário: `admin@gesso.com`
- Senha: `123456`

## 💾 Dados

Os dados são armazenados no `localStorage` para desenvolvimento. Para produção, recomenda-se integrar com:
- Supabase (recomendado)
- Firebase
- API customizada

## 🐛 Resolução de Problemas

### Erro de dependências
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro de build
```bash
npm run type-check
npm run lint
```

### Performance lenta
- Verifique o console para erros
- Limpe o localStorage: `localStorage.clear()`
- Reinicie o servidor de desenvolvimento

## 📞 Suporte

- **Issues**: [GitHub Issues](link-para-issues)
- **Documentação**: Este README
- **Email**: suporte@gesso.com

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🏆 Reconhecimentos

- [Shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Lucide](https://lucide.dev/) - Ícones
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Recharts](https://recharts.org/) - Gráficos

---

**Desenvolvido com ❤️ pela equipe Gesso Primus**
