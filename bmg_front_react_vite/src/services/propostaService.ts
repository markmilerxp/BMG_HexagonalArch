import { api } from './api';
import type {
  Proposta,
  CriarPropostaDto,
  AtualizarPropostaDto,
} from '../models/proposta';
import { statusApiParaNumero } from '../models/proposta';

// Service de Propostas copiado do projeto CRA, reutilizado aqui no Vite sem alterações.
function toProposta(p: any): Proposta {
  return {
    propostaId: p?.propostaId ?? p?.PropostaId ?? '',
    clienteNome: p?.clienteNome ?? p?.ClienteNome ?? '',
    valorCobertura: Number(p?.valorCobertura ?? p?.ValorCobertura ?? 0),
    status: statusApiParaNumero(p?.status ?? p?.Status ?? 1),
    dataAtualizacao: p?.dataAtualizacao ?? p?.DataAtualizacao ?? null,
  };
}

function asArray<T>(raw: any, mapFn: (item: any) => T): T[] {
  if (Array.isArray(raw)) return raw.map(mapFn);
  if (raw != null && typeof raw === 'object') return [mapFn(raw)];
  return [];
}

export async function listarPropostas(): Promise<Proposta[]> {
  const { data } = await api.get<any>('/propostas');
  return asArray(data, toProposta);
}

export async function criarProposta(dto: CriarPropostaDto): Promise<Proposta> {
  const { data } = await api.post<any>('/propostas', dto);
  return toProposta(data);
}

export async function atualizarProposta(
  id: string,
  dto: AtualizarPropostaDto,
): Promise<Proposta> {
  const { data } = await api.put<any>(`/propostas/${id}`, dto);
  return toProposta(data);
}

export async function excluirProposta(id: string): Promise<void> {
  await api.delete<void>(`/propostas/${id}`);
}

