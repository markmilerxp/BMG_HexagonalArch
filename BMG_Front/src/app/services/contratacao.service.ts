import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ContratacaoResponse, ContratacaoDto, ContratarRequest, VerificarStatusResponse, PropostaComContratoDto } from '../models/contratacao.model';

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
    numeroContrato: raw.numeroContrato ?? raw.NumeroContrato ?? null
  };
}

/** Garante que a resposta seja sempre um array. */
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
    jaExistia: raw.jaExistia ?? raw.JaExistia ?? false
  };
}

@Injectable({ providedIn: 'root' })
export class ContratacaoService {
  private url = `${environment.apiUrl}/contratacoes`;

  constructor(private http: HttpClient) {}

  /** Lista todas as contratações (PropostaId, DataContratacao, NumeroContrato). */
  listarContratacoes(): Observable<ContratacaoDto[]> {
    return this.http.get<any[]>(this.url).pipe(
      map(list => (list ?? []).map(c => toContratacaoDto(c)))
    );
  }

  /** Todas as propostas com dados de contratação em uma única chamada (mais rápido). */
  listarPropostasComContrato(): Observable<PropostaComContratoDto[]> {
    return this.http.get<any>(`${this.url}/propostas`).pipe(
      map(raw => asArrayPropostasComContrato(raw))
    );
  }

  contratar(propostaId: string): Observable<ContratacaoResponse> {
    const body: ContratarRequest = { propostaId };
    return this.http.post<any>(this.url, body).pipe(
      map(r => ({
        contratacao: toContratacaoDto(r?.contratacao ?? r?.Contratacao),
        mensagem: r?.mensagem ?? r?.Mensagem ?? ''
      }))
    );
  }

  verificarStatus(propostaId: string): Observable<VerificarStatusResponse> {
    return this.http.get<any>(`${this.url}/verificar-status/${propostaId}`).pipe(
      map(r => ({
        mensagem: r?.mensagem ?? r?.Mensagem ?? 'OK',
        status: Number(r?.status ?? r?.Status ?? 1)
      }))
    );
  }
}
