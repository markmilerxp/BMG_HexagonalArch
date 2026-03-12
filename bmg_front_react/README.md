## BMG Front React

Aplicação React que replica as telas de **Propostas** e **Contratações** do front Angular (`BMG_Front`), consumindo a mesma API .NET da solução Hexagonal.

### Tecnologias usadas

- **React + TypeScript** (`create-react-app` com template TS)
- **React Router DOM**: roteamento entre:
  - `/propostas` → tela de manutenção de propostas
  - `/contratacoes` → tela de contratações
- **Axios**: cliente HTTP para consumir a API backend via `/api`
- **CSS modular simples**: cada página/componente tem seu próprio `.css`

### Estrutura principal

- **`src/App.tsx`**
  - Define o layout com **sidebar** (menu lateral) e área principal.
  - Configura as rotas com `BrowserRouter`, `Routes` e `NavLink`:
    - `/propostas` → `PropostasPage`
    - `/contratacoes` → `ContratacoesPage`
    - `/` e rotas desconhecidas redirecionam para `/propostas`.

- **Modelos (tipos)** – espelham os DTOs do Angular:
  - `src/models/proposta.ts`
    - `Proposta`, `CriarPropostaDto`, `AtualizarPropostaDto`
    - `StatusNumero`, `STATUS_NUMEROS`, `STATUS_LABEL_POR_NUMERO`
    - `statusApiParaNumero` para normalizar o status vindo da API.
  - `src/models/contratacao.ts`
    - `PropostaComContratoDto`, `ContratacaoDto`, `ContratarRequest`, `ContratacaoResponse`, `VerificarStatusResponse`

- **Serviços HTTP (axios)** – equivalentes aos `*.service.ts` do Angular:
  - `src/services/api.ts`
    - Instância axios com `baseURL: '/api'` (mesma ideia do proxy do Angular).
  - `src/services/propostaService.ts`
    - `listarPropostas()`
    - `criarProposta(dto)`
    - `atualizarProposta(id, dto)`
    - `excluirProposta(id)`
    - Faz o *mapping* camelCase/PascalCase para o modelo do front.
  - `src/services/contratacaoService.ts`
    - `listarPropostasComContrato()`
    - `contratarProposta(propostaId)`
    - `verificarStatus(propostaId)`
    - Também faz o *mapping* dos campos da API.

- **Páginas (views)** – espelham os componentes Angular:
  - `src/pages/PropostasPage.tsx`
    - Lista propostas com filtro (ID, cliente, status, label).
    - Formulário para **criar** proposta.
    - Formulário para **editar** proposta (nome, valor, status).
    - Regras de status iguais às do Angular (transições permitidas).
    - Exibe alertas de sucesso/erro.
    - Usa classes de status/linha para colorir a tabela.
  - `src/pages/ContratacoesPage.tsx`
    - Lista **propostas com dados de contratação**.
    - Painel superior mostra os detalhes da proposta selecionada.
    - Botão **Contratar** habilitado somente quando `status === Aprovada`.
    - Após contratar, mostra mensagem de sucesso e recarrega a lista.

- **Componentes compartilhados**
  - `src/components/ConfirmModal.tsx` + `ConfirmModal.css`
    - Modal de confirmação genérico (`titulo`, `mensagem`, labels, tipo `confirmar`/`perigo`).
    - Usado para confirmar **exclusão de proposta** e **contratação**.

### Integração com o backend

- A API é acessada via `'/api'` (axios `baseURL`), assumindo que:
  - O backend .NET está rodando na mesma máquina (ex.: `http://localhost:5240`).
  - O proxy (ou reverse proxy) redireciona `/api` para o backend.
- Os *endpoints* utilizados:
  - `GET /api/propostas`
  - `POST /api/propostas`
  - `PUT /api/propostas/{id}`
  - `DELETE /api/propostas/{id}`
  - `GET /api/contratacoes/propostas`
  - `POST /api/contratacoes`
  - `GET /api/contratacoes/verificar-status/{propostaId}` (se necessário).

### Como rodar localmente

1. **Backend (.NET API)**
   - Abrir um terminal em `API/`
   - Executar:
     - `dotnet run`

2. **Frontend React**
   - Abrir outro terminal em `bmg_front_react/`
   - Instalar dependências (apenas na primeira vez):
     - `npm install`
   - Subir o dev server:
     - `npm start`
   - Acessar no browser:
     - `http://localhost:3000`

### O que o dev precisa entender

- O React aqui **não tem login nem tela de help** – só Propostas e Contratações.
- Toda a regra de negócio de status, filtros e contratação foi portada do Angular.
- Se mudar contratos/DTOs no backend, provavelmente será necessário ajustar:
  - *mappers* em `propostaService.ts` / `contratacaoService.ts`
  - tipos em `models/*.ts`
  - e, eventualmente, as telas em `pages/*.tsx`.
