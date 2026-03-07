import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContratacaoService } from '../../services/contratacao.service';
import { PropostaComContratoDto } from '../../models/contratacao.model';
import { STATUS_LABELS } from '../../models/proposta.model';

@Component({
  selector: 'app-contratacoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contratacoes.component.html',
  styleUrls: ['./contratacoes.component.scss']
})
export class ContratacoesComponent implements OnInit {
  statusLabels = STATUS_LABELS;

  propostas: PropostaComContratoDto[] = [];
  propostasFiltradas: PropostaComContratoDto[] = [];
  propostaSelecionada: PropostaComContratoDto | null = null;
  filtro = '';
  carregando = false;
  erro = '';
  sucesso = '';

  contratandoId: string | null = null;

  constructor(private contratacaoService: ContratacaoService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = '';
    this.propostaSelecionada = null;
    this.contratacaoService.listarPropostasComContrato().subscribe({
      next: (data) => {
        this.propostas = data ?? [];
        this.aplicarFiltro();
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Erro ao carregar dados.';
        this.carregando = false;
      }
    });
  }

  selecionarProposta(p: PropostaComContratoDto): void {
    this.propostaSelecionada = this.propostaSelecionada?.propostaId === p.propostaId ? null : p;
  }

  aplicarFiltro(): void {
    const termo = (this.filtro ?? '').toLowerCase().trim();
    const list = this.propostas ?? [];
    this.propostasFiltradas = termo
      ? list.filter(p => {
          const nome = (p.clienteNome ?? '').toLowerCase();
          const status = (p.status ?? '').toLowerCase();
          const statusLabel = (this.statusLabels[p.status ?? ''] ?? '').toLowerCase();
          const id = (p.propostaId ?? '').toLowerCase();
          return id.includes(termo) || nome.includes(termo) || status.includes(termo) || statusLabel.includes(termo);
        })
      : [...list];
  }

  contratarProposta(p: PropostaComContratoDto): void {
    this.contratandoId = p.propostaId;
    this.erro = '';
    this.contratacaoService.contratar(p.propostaId).subscribe({
      next: (res) => {
        this.contratandoId = null;
        this.sucesso = res.mensagem + (res.contratacao?.numeroContrato ? ` — Nº ${res.contratacao.numeroContrato}` : '');
        this.carregar();
        setTimeout(() => this.sucesso = '', 5000);
      },
      error: (err) => {
        this.contratandoId = null;
        this.erro = err?.error ?? 'Erro ao contratar. Verifique se a proposta está aprovada.';
        setTimeout(() => this.erro = '', 5000);
      }
    });
  }

  formatarValor(valor: number): string {
    return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatarData(data: string | null): string {
    if (!data) return '-';
    return new Date(data).toLocaleString('pt-BR');
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      EmAnalise: 'badge-analise',
      Aprovada: 'badge-aprovada',
      Rejeitada: 'badge-rejeitada',
      Contratada: 'badge-contratada'
    };
    return map[status ?? ''] ?? '';
  }
}
