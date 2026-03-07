# BMG Seguros – Frontend

Sistema de gerenciamento de **Propostas** e **Contratações** de seguros. Este frontend consome a API do backend (Arquitetura Hexagonal).

## Visão geral

O sistema permite:
- **Criar propostas** de seguro (nome do cliente e valor da cobertura)
- **Alterar o status** das propostas conforme as regras de transição
- **Contratar** propostas aprovadas (gera número de contrato e atualiza status para Contratada)
- **Excluir** propostas que não estejam com status Contratada

## Status das propostas

| Status      | Valor | Descrição                                      |
|------------|-------|------------------------------------------------|
| Em Análise | 1     | Status inicial ao criar a proposta             |
| Aprovada   | 2     | Proposta aprovada e pode ser contratada        |
| Rejeitada  | 3     | Proposta rejeitada                             |
| Contratada | 4     | Proposta já contratada (status final)          |

## Regras de transição de status

- **Em Análise** → pode ir para **Aprovada** ou **Rejeitada**
- **Aprovada** → pode ir para **Contratada** (somente pela tela de Contratações, ao confirmar)
- **Rejeitada** → não pode mudar para outro status
- **Contratada** → não pode mudar para outro status

## Telas

### Propostas
- Criar proposta: Nome do Cliente e Valor da Cobertura (status inicial: Em Análise)
- Alterar status: apenas transições permitidas
- Excluir: somente se o status for **diferente de Contratada**
- Busca: por ID da proposta, nome do cliente ou status (incluindo texto ex.: "Em Análise", "Aprovada")

### Contratações
- Lista **todas as propostas** (qualquer status)
- Exibe os 3 campos da contratação quando houver: **PropostaId**, **Data Contratação**, **Nº Contrato**
- Botão **Confirmar**: habilitado apenas para propostas **Aprovadas**; ao confirmar, a proposta passa a Contratada e recebe número de contrato

## Login

- **Usuário:** admin  
- **Senha:** admin  

## Tecnologias

- Angular (standalone)
- RxJS, HttpClient
- Proxy para API (desenvolvimento)

## Executar

```bash
npm install
ng serve
```

Acesse `http://localhost:4200`. A API deve estar rodando (ex.: `http://localhost:5240`) para as chamadas funcionarem.
