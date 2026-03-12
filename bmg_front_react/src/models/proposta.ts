export type StatusNumero = 1 | 2 | 3 | 4;

export interface Proposta {
  propostaId: string;
  clienteNome: string;
  valorCobertura: number;
  status: StatusNumero;
  dataAtualizacao: string | null;
}

export interface CriarPropostaDto {
  clienteNome: string;
  valorCobertura: number;
}

export interface AtualizarPropostaDto {
  clienteNome: string;
  valorCobertura: number;
  status: StatusNumero;
}

export const STATUS_ENUM = {
  EmAnalise: 1,
  Aprovada: 2,
  Rejeitada: 3,
  Contratada: 4,
} as const;

export const STATUS_NUMEROS: StatusNumero[] = [1, 2, 3, 4];

export const STATUS_LABEL_POR_NUMERO: Record<StatusNumero, string> = {
  1: 'Em Análise',
  2: 'Aprovada',
  3: 'Rejeitada',
  4: 'Contratada',
};

export function statusApiParaNumero(status: string | number | null | undefined): StatusNumero {
  if (status === null || status === undefined) return 1;
  const n = typeof status === 'number' ? status : parseInt(String(status).trim(), 10);
  if (!Number.isNaN(n) && n >= 1 && n <= 4) return n as StatusNumero;
  return 1;
}

