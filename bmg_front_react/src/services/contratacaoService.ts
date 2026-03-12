import { api } from './api';
import {
  ContratacaoResponse,
  ContratacaoDto,
  ContratarRequest,
  VerificarStatusResponse,
  PropostaComContratoDto,
} from '../models/contratacao';

function toPropostaComContratoDto(p: any): PropostaComContratoDto {
  const raw = p ?? {};
  const status = raw.status ?? raw.Status ?? 1;
  return {
    propostaId: raw.propostaId ?? raw.PropostaId ?? '',
    clienteNome: raw.clienteNome ?? raw.ClienteNome ?? '',
    valorCobertura: Number(raw.valorCobertura ?? raw.ValorCobertura ?? 0),
    status: typeof status === 'number' && status >= 1 && status <= 4 ? status : 1,
    dataAtualizacao: raw.dataAtualizacao ?? raw.DataAtualizacao ?? null,
    dataContratacao: raw.dataContratacao ?? raw.DataContratacao ?? null,
    numeroContrato: raw.numeroContrato ?? raw.NumeroContrato ?? null,
  };
}

function asArrayPropostasComContrato(raw: any): PropostaComContratoDto[] {
  if (Array.isArray(raw)) return raw.map(toPropostaComContratoDto);
  if (raw != null && typeof raw === 'object') return [toPropostaComContratoDto(raw)];
  return [];
}

function toContratacaoDto(c: any): ContratacaoDto {
  const raw = c ?? {};
  return {
    propostaId: raw.propostaId ?? raw.PropostaId ?? '',
    dataContratacao: raw.dataContratacao ?? raw.DataContratacao ?? '',
    numeroContrato: raw.numeroContrato ?? raw.NumeroContrato ?? '',
    jaExistia: raw.jaExistia ?? raw.JaExistia ?? false,
  };
}

export async function listarPropostasComContrato(): Promise<PropostaComContratoDto[]> {
  const { data } = await api.get<any>('/contratacoes/propostas');
  return asArrayPropostasComContrato(data);
}

export async function contratarProposta(
  propostaId: string,
): Promise<ContratacaoResponse> {
  const body: ContratarRequest = { propostaId };
  const { data } = await api.post<any>('/contratacoes', body);
  return {
    contratacao: toContratacaoDto(data?.contratacao ?? data?.Contratacao),
    mensagem: data?.mensagem ?? data?.Mensagem ?? '',
  };
}

export async function verificarStatus(
  propostaId: string,
): Promise<VerificarStatusResponse> {
  const { data } = await api.get<any>(`/contratacoes/verificar-status/${propostaId}`);
  return {
    mensagem: data?.mensagem ?? data?.Mensagem ?? 'OK',
    status: Number(data?.status ?? data?.Status ?? 1),
  };
}

