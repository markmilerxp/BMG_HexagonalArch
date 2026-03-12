import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { timeout, catchError, finalize, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContratacaoService } from '../../services/contratacao.service';
import { PropostaComContratoDto } from '../../models/contratacao.model';
import { STATUS_NUMEROS, STATUS_LABEL_POR_NUMERO, type StatusNumero } from '../../models/proposta.model';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-contratacoes',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './contratacoes.component.html',
  styleUrls: ['./contratacoes.component.scss']
})
export class ContratacoesComponent implements OnInit {
  statusNumeros = STATUS_NUMEROS;
  statusLabelPorNumero = STATUS_LABEL_POR_NUMERO;

  labelStatus(n: number): string {
    return STATUS_LABEL_POR_NUMERO[n as StatusNumero] ?? '';
  }

  propostasFiltradas$ = new BehaviorSubject<PropostaComContratoDto[]>([]);
  propostas: PropostaComContratoDto[] = [];
  propostaSelecionada: PropostaComContratoDto | null = null;
  filtro = '';
  carregando = false;
  erro = '';
  sucesso = '';

  contratandoId: string | null = null;
  modalContratarAberto = false;

  get mensagemModalContratar(): string {
    if (!this.propostaSelecionada) return 'Deseja realmente contratar esta proposta?';
    return `Deseja realmente contratar a proposta de "${this.propostaSelecionada.clienteNome}" (${this.formatarValor(this.propostaSelecionada.valorCobertura)})?`;
  }

  constructor(private contratacaoService: ContratacaoService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = '';
    this.propostaSelecionada = null;
    this.contratacaoService.listarPropostasComContrato().pipe(
      timeout(15000),
      catchError(() => {
        this.erro = 'Erro ou timeout ao carregar. Verifique se a API está rodando (ex.: localhost:5240).';
        return of([]);
      }),
      finalize(() => { this.carregando = false; })
    ).subscribe(data => {
      const list = Array.isArray(data) ? [...data] : [];
      this.propostas = list;
      this.aplicarFiltro();
    });
  }

  trackByPropostaId(_index: number, p: PropostaComContratoDto): string {
    return p.propostaId;
  }

  selecionarProposta(p: PropostaComContratoDto): void {
    this.propostaSelecionada = this.propostaSelecionada?.propostaId === p.propostaId ? null : p;
  }

  aplicarFiltro(): void {
    const termo = (this.filtro ?? '').toLowerCase().trim();
    const list = this.propostas ?? [];
    const filtradas = termo
      ? list.filter(p => {
          const nome = (p.clienteNome ?? '').toLowerCase();
          const statusLabel = (STATUS_LABEL_POR_NUMERO[p.status as StatusNumero] ?? '').toLowerCase();
          const id = (p.propostaId ?? '').toLowerCase();
          return id.includes(termo) || nome.includes(termo) || String(p.status).includes(termo) || statusLabel.includes(termo);
        })
      : [...list];
    this.propostasFiltradas$.next(filtradas);
  }

  abrirModalContratar(): void {
    if (this.propostaSelecionada?.status === 2) this.modalContratarAberto = true; // 2 = Aprovada
  }

  fecharModalContratar(): void {
    this.modalContratarAberto = false;
  }

  confirmarContratar(): void {
    this.fecharModalContratar();
    if (this.propostaSelecionada) this.contratarProposta(this.propostaSelecionada);
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

  formatarData(data: string | null | undefined): string {
    if (data == null || data === '') return '-';
    return new Date(data).toLocaleString('pt-BR');
  }

  getStatusClass(status: number): string {
    const map: Record<StatusNumero, string> = {
      1: 'badge-analise',
      2: 'badge-aprovada',
      3: 'badge-rejeitada',
      4: 'badge-contratada'
    };
    return map[status as StatusNumero] ?? '';
  }
}
