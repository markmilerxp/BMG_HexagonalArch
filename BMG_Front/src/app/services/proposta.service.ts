import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Proposta, CriarPropostaDto, AtualizarStatusDto, AtualizarPropostaDto, statusApiParaNumero, type StatusNumero } from '../models/proposta.model';

/** Normaliza objeto da API (camelCase) para o modelo do front. Status vem como número (1-4). */
function toProposta(p: any): Proposta {
  return {
    propostaId: p?.propostaId ?? p?.PropostaId ?? '',
    clienteNome: p?.clienteNome ?? p?.ClienteNome ?? '',
    valorCobertura: Number(p?.valorCobertura ?? p?.ValorCobertura ?? 0),
    status: statusApiParaNumero(p?.status ?? p?.Status ?? 1),
    dataAtualizacao: p?.dataAtualizacao ?? p?.DataAtualizacao ?? null
  };
}

/** Garante que a resposta seja sempre um array (API pode retornar [] ou, em alguns casos, um único objeto). */
function asArray<T>(raw: any, mapFn: (item: any) => T): T[] {
  if (Array.isArray(raw)) return raw.map(mapFn);
  if (raw != null && typeof raw === 'object') return [mapFn(raw)];
  return [];
}

@Injectable({ providedIn: 'root' })
export class PropostaService {
  private url = `${environment.apiUrl}/propostas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Proposta[]> {
    return this.http.get<any>(this.url).pipe(
      map(raw => asArray(raw, toProposta))
    );
  }

  obterPorId(id: string): Observable<Proposta> {
    return this.http.get<any>(`${this.url}/${id}`).pipe(map(toProposta));
  }

  criar(dto: CriarPropostaDto): Observable<Proposta> {
    return this.http.post<any>(this.url, dto).pipe(map(toProposta));
  }

  atualizarStatus(id: string, dto: AtualizarStatusDto): Observable<Proposta> {
    return this.http.put<any>(`${this.url}/${id}/status`, dto).pipe(map(toProposta));
  }

  /** Atualiza proposta (nome, valor, status). A data é atualizada automaticamente no servidor. */
  atualizarProposta(id: string, dto: AtualizarPropostaDto): Observable<Proposta> {
    return this.http.put<any>(`${this.url}/${id}`, dto).pipe(map(toProposta));
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
