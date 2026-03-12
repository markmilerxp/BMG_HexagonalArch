export type StatusNumero = 1 | 2 | 3 | 4;

export interface Proposta {
  propostaId: string;
  clienteNome: string;
  valorCobertura: number;
  /** Número do enum: 1=EmAnalise, 2=Aprovada, 3=Rejeitada, 4=Contratada. */
  status: StatusNumero;
  dataAtualizacao: string | null;
}

export interface CriarPropostaDto {
  clienteNome: string;
  valorCobertura: number;
}

export interface AtualizarStatusDto {
  /** Número do enum (1-4). */
  status: StatusNumero;
}

/** Enum numérico igual ao backend (banco grava número). 1=EmAnalise, 2=Aprovada, 3=Rejeitada, 4=Contratada. */
export const STATUS_ENUM = {
  EmAnalise: 1,
  Aprovada: 2,
  Rejeitada: 3,
  Contratada: 4
} as const;

/** Lista dos números de status (para iterar). */
export const STATUS_NUMEROS: StatusNumero[] = [1, 2, 3, 4];

/** Texto para exibir na tela (só visual). */
export const STATUS_LABEL_POR_NUMERO: Record<StatusNumero, string> = {
  1: 'Em Análise',
  2: 'Aprovada',
  3: 'Rejeitada',
  4: 'Contratada'
};

/** Transições permitidas na tela Propostas: de cada status para quais números pode ir. Contratada não se escolhe aqui. */
export const TRANSICOES_POR_NUMERO: Record<StatusNumero, StatusNumero[]> = {
  1: [2, 3],       // EmAnalise → Aprovada, Rejeitada
  2: [1, 3],       // Aprovada → EmAnalise, Rejeitada
  3: [1, 2],       // Rejeitada → EmAnalise, Aprovada
  4: []            // Contratada: sem transição na tela Propostas
};

/** Garante que o valor da API (número) seja um StatusNumero válido (1-4). */
export function statusApiParaNumero(status: string | number | null | undefined): StatusNumero {
  if (status === null || status === undefined) return 1;
  const n = typeof status === 'number' ? status : parseInt(String(status).trim(), 10);
  if (!Number.isNaN(n) && n >= 1 && n <= 4) return n as StatusNumero;
  return 1;
}

export interface AtualizarPropostaDto {
  clienteNome: string;
  valorCobertura: number;
  /** Número do enum (1-4). */
  status: StatusNumero;
}
