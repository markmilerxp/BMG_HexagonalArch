export interface ContratacaoDto {
  propostaId: string;
  dataContratacao: string;
  numeroContrato: string;
  jaExistia: boolean;
}

export interface ContratarRequest {
  propostaId: string;
}

export interface ContratacaoResponse {
  contratacao: ContratacaoDto;
  mensagem: string;
}

export interface VerificarStatusResponse {
  mensagem: string;
  /** Número do enum: 1=EmAnalise, 2=Aprovada, 3=Rejeitada, 4=Contratada. */
  status: number;
}

/** Proposta com dados de contratação (resposta do GET /api/contratacoes/propostas). */
export interface PropostaComContratoDto {
  propostaId: string;
  clienteNome: string;
  valorCobertura: number;
  /** Número do enum: 1=EmAnalise, 2=Aprovada, 3=Rejeitada, 4=Contratada. */
  status: number;
  dataAtualizacao: string | null;
  dataContratacao?: string | null;
  numeroContrato?: string | null;
}
