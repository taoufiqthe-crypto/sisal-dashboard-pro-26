# 🤝 Guia de Contribuição

Obrigado por seu interesse em contribuir com o Sistema PDV Gesso Primus! Este documento fornece diretrizes para contribuições.

## 📋 Índice

- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Commits](#commits)
- [Pull Requests](#pull-requests)
- [Testes](#testes)
- [Reportar Bugs](#reportar-bugs)

## 🚀 Como Contribuir

### 1. Fork e Clone
```bash
# Fork no GitHub e clone
git clone https://github.com/seu-usuario/sistema-pdv.git
cd sistema-pdv
```

### 2. Instale Dependências
```bash
npm install
```

### 3. Crie uma Branch
```bash
git checkout -b feature/minha-feature
# ou
git checkout -b fix/meu-fix
```

### 4. Desenvolva
- Faça suas alterações
- Adicione testes se necessário
- Teste localmente

### 5. Commit e Push
```bash
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/minha-feature
```

### 6. Abra um Pull Request
- Descreva claramente as mudanças
- Referencie issues relacionadas
- Aguarde review

## ⚙️ Configuração do Ambiente

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Git
- Editor com suporte TypeScript (VS Code recomendado)

### Extensões VS Code Recomendadas
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Configuração Local
```bash
# Instalar dependências
npm install

# Configurar Husky (hooks de git)
npm run prepare

# Executar em desenvolvimento
npm run dev
```

## 📝 Padrões de Código

### TypeScript
- Use tipos explícitos quando necessário
- Prefira interfaces a types para objetos
- Use enums para constantes relacionadas
- Evite `any`, use `unknown` se necessário

```typescript
// ✅ Bom
interface Product {
  id: number;
  name: string;
  price: number;
}

// ❌ Evitar
const product: any = {};
```

### React
- Componentes funcionais com hooks
- Use `useCallback` e `useMemo` quando apropriado
- Props sempre tipadas
- Componentes pequenos e focados

```typescript
// ✅ Bom
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}
```

### CSS/Tailwind
- Use classes do Tailwind sempre que possível
- Crie componentes reutilizáveis para estilos complexos
- Mantenha responsividade em mente
- Use variáveis CSS para temas

```typescript
// ✅ Bom
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">

// ❌ Evitar estilos inline
<div style={{display: 'flex', padding: '16px'}}>
```

### Estrutura de Arquivos
```
src/
├── components/
│   ├── ui/              # Componentes base reutilizáveis
│   ├── feature/         # Componentes específicos por feature
│   └── layout/          # Componentes de layout
├── hooks/               # Custom hooks
├── lib/                 # Utilitários e configurações
├── types/               # Definições de tipos
└── tests/               # Testes
```

## 📦 Commits

### Padrão Conventional Commits
```
type(scope): description

body (opcional)

footer (opcional)
```

### Tipos Permitidos
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, sem mudança de código
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Manutenção, build, dependencies

### Exemplos
```bash
# Nova funcionalidade
git commit -m "feat(pdv): adiciona busca por código de barras"

# Correção de bug
git commit -m "fix(cart): corrige cálculo de desconto"

# Documentação
git commit -m "docs: atualiza README com instruções Docker"

# Refatoração
git commit -m "refactor(components): extrai hook useCart"
```

## 🔄 Pull Requests

### Antes de Abrir
- [ ] Código testado localmente
- [ ] Testes passando (`npm run test`)
- [ ] Linting sem erros (`npm run lint`)
- [ ] Build funcionando (`npm run build`)
- [ ] Documentação atualizada se necessário

### Template de PR
```markdown
## Descrição
Breve descrição das mudanças realizadas.

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. Passos para reproduzir
2. Dados de teste necessários
3. Comportamento esperado

## Checklist
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Código revisado
- [ ] Build passando
```

## 🧪 Testes

### Executar Testes
```bash
# Todos os testes
npm run test

# Modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

### Escrevendo Testes
```typescript
// component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button onClick={vi.fn()}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

### Cobertura Mínima
- Componentes críticos: 90%+
- Utilities: 95%+
- Hooks: 85%+

## 🐛 Reportar Bugs

### Template de Issue
```markdown
**Descrição do Bug**
Descrição clara e concisa do problema.

**Para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente**
- OS: [e.g. Windows, macOS]
- Browser: [e.g. Chrome, Firefox]
- Versão: [e.g. 22]

**Contexto Adicional**
Qualquer informação adicional sobre o problema.
```

## 🎨 Design System

### Cores
- Use variáveis CSS definidas em `index.css`
- Mantenha consistência com o tema
- Teste em modo claro e escuro

### Componentes
- Baseados no Shadcn/ui
- Personalizações em `components/ui/`
- Documentação inline com comentários

### Responsividade
- Mobile-first approach
- Breakpoints Tailwind padrão
- Teste em diferentes dispositivos

## 🔧 Scripts Úteis

```bash
# Linting e formatação
npm run lint            # Verificar
npm run lint:fix        # Corrigir automaticamente
npm run format          # Formatar com Prettier
npm run format:check    # Verificar formatação

# Desenvolvimento
npm run dev             # Servidor de desenvolvimento
npm run build           # Build para produção
npm run preview         # Preview da build

# Testes
npm run test            # Executar testes
npm run test:watch      # Modo watch
npm run test:coverage   # Relatório de cobertura
```

## ❓ Dúvidas

- **Issues**: Para bugs e discussões
- **Discussions**: Para perguntas e ideias
- **Email**: dev@gesso.com

## 🏆 Reconhecimento

Contribuidores são listados automaticamente no README. Agradecemos a todos que ajudam a melhorar este projeto!

---

**Obrigado por contribuir! 🙏**