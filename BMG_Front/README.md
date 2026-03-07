# 🖥️ BMG Seguros – Frontend

Interface web para gerenciamento de **Propostas** e **Contratações** de seguros. Desenvolvido em **Angular**, consome a API do backend (Arquitetura Hexagonal). *(README atualizado com ícones e estilo do backend.)*

## 📋 Visão Geral

O frontend permite o fluxo completo de propostas e contratações, com validações de negócio e integração via **proxy** com a API REST.

### 🎯 Funcionalidades Principais

#### **Propostas**
- ✅ **Criar proposta** – Nome do cliente e valor da cobertura (status inicial: Em Análise)
- ✅ **Alterar status** – Apenas transições permitidas pelas regras de negócio
- ✅ **Excluir proposta** – Somente se o status for **diferente de Contratada**
- ✅ **Buscar** – Por ID da proposta, nome do cliente ou status (ex.: "Em Análise", "Aprovada")

#### **Contratações**
- ✅ **Listar propostas** – Todas as propostas (qualquer status)
- ✅ **Exibir contratação** – PropostaId, Data Contratação e Nº Contrato quando houver
- ✅ **Confirmar contratação** – Botão habilitado apenas para propostas **Aprovadas**; ao confirmar, a proposta passa a Contratada e recebe número de contrato

## 🏛️ Estrutura do Projeto

```
BMG_Front/
├── src/
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.routes.ts
│   │   └── ...                    # Componentes e serviços
│   ├── main.ts
│   ├── index.html
│   └── styles.scss
├── public/                         # Assets estáticos
├── angular.json                    # Configuração Angular
├── proxy.conf.json                 # Proxy para API (dev)
├── tsconfig.json
├── package.json
└── README.md
```

## 📊 Status das Propostas

O frontend trabalha com os **4 status** alinhados ao backend:

| Status       | Valor | Descrição                                      |
|-------------|-------|------------------------------------------------|
| **Em Análise** | 1     | Status inicial ao criar a proposta             |
| **Aprovada**   | 2     | Proposta aprovada e pode ser contratada        |
| **Rejeitada**  | 3     | Proposta rejeitada                             |
| **Contratada** | 4     | Proposta já contratada (status final)          |

### **Regras de Transição**
- ✅ **Em Análise** → **Aprovada** ou **Rejeitada**
- ✅ **Aprovada** → **Contratada** (somente pela tela de Contratações, ao confirmar)
- ❌ **Rejeitada** → Nenhum outro status
- ❌ **Contratada** → Nenhum outro status

## 🖼️ Telas

### **Propostas**
- Formulário de criação com **Nome do Cliente** e **Valor da Cobertura**
- Alteração de status apenas para transições permitidas
- Exclusão somente se status ≠ Contratada
- Busca por ID, nome do cliente ou status (texto ou valor)

### **Contratações**
- Lista todas as propostas (qualquer status)
- Exibe **PropostaId**, **Data Contratação** e **Nº Contrato** quando existir contratação
- Botão **Confirmar** habilitado apenas para propostas **Aprovadas**

## 🔐 Login

- **Usuário:** `admin`
- **Senha:** `admin`

## 🔌 Integração com a API

### **Proxy (Desenvolvimento)**
- Requisições para `/api` são redirecionadas para a API do backend
- **Target:** `http://127.0.0.1:5240`
- Configurado em `proxy.conf.json` e usado pelo `ng serve`

### **Fluxo**

```
┌─────────────────┐         /api/*          ┌─────────────────┐
│   BMG_Front     │  ───────────────────►   │   API Backend   │
│   (Angular)     │   proxy.conf.json       │   (Arquitetura   │
│   :4200         │   (dev)                 │    Hexagonal)    │
└─────────────────┘                         │   :5240          │
                                             └─────────────────┘
```

## 🔧 Tecnologias

- **Angular** – Framework frontend
- **RxJS** – Programação reativa
- **HttpClient** – Chamadas à API
- **SCSS** – Estilos
- **Proxy** – Redirecionamento da API em desenvolvimento

## 🚀 Executar

```bash
# Na pasta BMG_Front
npm install
npm start
# ou: ng serve
```

- **Frontend:** http://localhost:4200  
- **API:** deve estar rodando (ex.: http://localhost:5240) para as chamadas funcionarem.

## 📝 Notas

- ✅ Interface alinhada às regras de negócio do backend
- ✅ Validações de transição de status na UI
- ✅ Proxy configurado para desenvolvimento local
- ✅ Login simples (admin/admin) para acesso às telas

---

**📄 Backend:** Consulte o [README principal](../README.md) do projeto para visão da Arquitetura Hexagonal, API e infraestrutura.
