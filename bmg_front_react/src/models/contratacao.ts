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
  status: number;
}

export interface PropostaComContratoDto {
  propostaId: string;
  clienteNome: string;
  valorCobertura: number;
  status: number;
  dataAtualizacao: string | null;
  dataContratacao?: string | null;
  numeroContrato?: string | null;
}

