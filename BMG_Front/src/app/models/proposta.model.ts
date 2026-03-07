export interface Proposta {
  propostaId: string;
  clienteNome: string;
  valorCobertura: number;
  status: string;
  dataAtualizacao: string | null;
}

export interface CriarPropostaDto {
  clienteNome: string;
  valorCobertura: number;
}

export interface AtualizarStatusDto {
  status: string;
}

export const STATUS_PROPOSTA = ['EmAnalise', 'Aprovada', 'Rejeitada', 'Contratada'] as const;
export type StatusProposta = typeof STATUS_PROPOSTA[number];

export const STATUS_LABELS: Record<string, string> = {
  EmAnalise:  'Em Análise',
  Aprovada:   'Aprovada',
  Rejeitada:  'Rejeitada',
  Contratada: 'Contratada'
};

export const STATUS_TRANSICOES: Record<string, string[]> = {
  EmAnalise:  ['Aprovada', 'Rejeitada'],
  Aprovada:   ['Contratada'],
  Rejeitada:  [],
  Contratada: []
};
