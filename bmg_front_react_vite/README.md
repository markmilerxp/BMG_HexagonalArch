## BMG Front React (Vite)

Este projeto é a versão em **Vite + React + TypeScript** do front de Propostas/Contratações que antes estava em **Create React App (CRA)**.

### O que mudou ao migrar para Vite

- **Ferramenta de build/dev**
  - Antes: `react-scripts` (CRA) com scripts `npm start`, `npm run build`.
  - Agora: **Vite** com scripts em `bmg_front_react_vite/package.json`:
    - `npm run dev` – dev server Vite.
    - `npm run build` – build de produção (`tsc -b && vite build`).
    - `npm run preview` – serve o build para teste local.

- **Ponto de entrada**
  - CRA usava `src/index.tsx` para fazer:
    - `ReactDOM.createRoot(...).render(<App />)`.
  - Vite usa `src/main.tsx`:
    - Faz o mesmo bootstrap, só que com `import App from './App'`.
    - Comentário no arquivo indica que ele é o “equivalente do index.tsx do CRA”.

- **Componente `App`**
  - O layout com **sidebar**, rotas (`/propostas`, `/contratacoes`) e `BrowserRouter` foi copiado do `App.tsx` do CRA para `bmg_front_react_vite/src/App.tsx`.
  - Comentário no topo do arquivo explicando que:
    - este `App` veio do projeto CRA;
    - aqui ele só cuida de layout/rotas; o bootstrap é responsabilidade do `main.tsx`.

- **Dependências de runtime**
  - Continuamos usando:
    - **`react` / `react-dom`** (já vêm no template Vite).
    - **`react-router-dom`** para rotas (`BrowserRouter`, `Routes`, `NavLink`, `Navigate`).
    - **`axios`** para chamadas HTTP (será usado nos mesmos services de Propostas/Contratações do projeto CRA).
  - Todas essas libs estão em `dependencies` do `package.json` do Vite.

- **CSS/layout**
  - O `src/App.css` do Vite foi substituído pelo CSS de layout do CRA:
    - classes `app-shell`, `sidebar`, `sidebar-logo`, `nav-item`, `main-content` etc.
  - Isso garante que o visual da versão Vite fique igual ao front React anterior.

### TypeScript com `verbatimModuleSyntax`

- O `tsconfig.app.json` deste projeto usa `verbatimModuleSyntax: true`.
- Isso significa que:
  - **Tipos** devem ser importados com `import type { ... } from '...'`.
  - **Funções/constantes/valores** continuam com `import { ... } from '...'`.
- Exemplos já aplicados no código:
  - `src/pages/PropostasPage.tsx`
  - `src/pages/ContratacoesPage.tsx`
  - `src/services/propostaService.ts`
  - `src/services/contratacaoService.ts`

### Fluxo recomendado: build antes de rodar

- Sempre que mexer em types/services/pages:
  - Rodar `npm run build` em `bmg_front_react_vite` para garantir que o TypeScript e o Vite compilam sem erro.
  - Depois subir o dev server normalmente com `npm run dev`.

### Como rodar o front com Vite

1. Backend .NET rodando (mesma API usada pelo Angular e pelo CRA).
2. Na pasta `bmg_front_react_vite`:
   - `npm install` (se ainda não rodou).
   - `npm run dev`.
3. Acessar a porta que o Vite mostrar (por padrão `http://localhost:5173`, ou a próxima livre, ex.: `5174`, `5175`).
