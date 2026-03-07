import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Proposta, CriarPropostaDto, AtualizarStatusDto } from '../models/proposta.model';

/** Normaliza objeto da API (PascalCase ou camelCase) para o modelo do front (camelCase). */
function toProposta(p: any): Proposta {
  return {
    propostaId: p?.propostaId ?? p?.PropostaId ?? '',
    clienteNome: p?.clienteNome ?? p?.ClienteNome ?? '',
    valorCobertura: Number(p?.valorCobertura ?? p?.ValorCobertura ?? 0),
    status: p?.status ?? p?.Status ?? '',
    dataAtualizacao: p?.dataAtualizacao ?? p?.DataAtualizacao ?? null
  };
}

@Injectable({ providedIn: 'root' })
export class PropostaService {
  private url = `${environment.apiUrl}/propostas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Proposta[]> {
    return this.http.get<any[]>(this.url).pipe(
      map(list => (list ?? []).map(toProposta))
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

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
