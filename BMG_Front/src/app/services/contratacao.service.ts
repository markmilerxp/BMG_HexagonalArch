import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ContratacaoResponse, ContratacaoDto, ContratarRequest, VerificarStatusResponse, PropostaComContratoDto } from '../models/contratacao.model';

function toPropostaComContratoDto(p: any): PropostaComContratoDto {
  const raw = p ?? {};
  return {
    propostaId: raw.propostaId ?? raw.PropostaId ?? '',
    clienteNome: raw.clienteNome ?? raw.ClienteNome ?? '',
    valorCobertura: Number(raw.valorCobertura ?? raw.ValorCobertura ?? 0),
    status: raw.status ?? raw.Status ?? '',
    dataAtualizacao: raw.dataAtualizacao ?? raw.DataAtualizacao ?? null,
    dataContratacao: raw.dataContratacao ?? raw.DataContratacao ?? null,
    numeroContrato: raw.numeroContrato ?? raw.NumeroContrato ?? null
  };
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
    return this.http.get<any[]>(`${this.url}/propostas`).pipe(
      map(list => (list ?? []).map(toPropostaComContratoDto))
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
        status: r?.status ?? r?.Status ?? ''
      }))
    );
  }
}
