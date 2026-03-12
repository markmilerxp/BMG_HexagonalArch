import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { timeout, catchError, finalize, of } from 'rxjs';
import { PropostaService } from '../../services/proposta.service';
import { Proposta, CriarPropostaDto, STATUS_NUMEROS, STATUS_LABEL_POR_NUMERO, TRANSICOES_POR_NUMERO, statusApiParaNumero, type StatusNumero } from '../../models/proposta.model';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-propostas',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './propostas.component.html',
  styleUrls: ['./propostas.component.scss']
})
export class PropostasComponent implements OnInit {
  /** Fonte única para o grid: a view usa propostasFiltradas$ | async. */
  propostasFiltradas$ = new BehaviorSubject<Proposta[]>([]);
  propostas: Proposta[] = [];
  filtro = '';
  carregando = false;
  erro = '';
  sucesso = '';

  // Formulário nova proposta
  novaPropostaForm: CriarPropostaDto = { clienteNome: '', valorCobertura: 0 };
  salvando = false;
  erroForm = '';

  // Edição (campos editáveis + novo status)
  editando = false;
  propostaSelecionada: Proposta | null = null;
  edicaoClienteNome = '';
  edicaoValorCobertura = 0;
  /** Valor selecionado no dropdown Novo Status — string do DOM (ex: "2"). Vazio = nada selecionado. */
  novoStatusStr: string = '';
  /** Opções do dropdown "Novo Status" (só as permitidas, todas habilitadas). Preenchido em iniciarEdicao. */
  opcoesStatusEdicaoList: StatusNumero[] = [];
  atualizandoStatus = false;

  modalExcluirAberto = false;
  propostaAExcluir: Proposta | null = null;

  get mensagemModalExcluir(): string {
    return this.propostaAExcluir
      ? `Excluir a proposta de "${this.propostaAExcluir.clienteNome}"?`
      : '';
  }

  statusNumeros = STATUS_NUMEROS;
  statusLabelPorNumero = STATUS_LABEL_POR_NUMERO;

  /** No cadastro: valor do enum (sempre 1 = Em Análise). */
  statusInicialNumero: StatusNumero = 1;

  /** Status atual da proposta em edição (já é número). */
  get statusAtualNumero(): StatusNumero {
    return this.propostaSelecionada?.status ?? 1;
  }

  labelStatus(n: StatusNumero): string {
    return STATUS_LABEL_POR_NUMERO[n] ?? '';
  }

  /** Data de hoje formatada (default no formulário de criação). */
  get dataHoje(): string {
    return new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }

  constructor(private propostaService: PropostaService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = '';
    this.propostaService.listar().pipe(
      timeout(15000),
      catchError(err => {
        const msg = err?.name === 'TimeoutError'
          ? 'Carregamento demorou muito. Verifique se a API está rodando (ex.: localhost:5240).'
          : 'Erro ao carregar propostas.';
        this.erro = msg;
        return of([]);
      }),
      finalize(() => { this.carregando = false; })
    ).subscribe(data => {
      const list = Array.isArray(data) ? [...data] : [];
      this.propostas = list;
      this.aplicarFiltro();
    });
  }

  trackByPropostaId(_index: number, p: Proposta): string {
    return p.propostaId;
  }

  aplicarFiltro(): void {
    const termo = (this.filtro ?? '').toLowerCase().trim();
    const list = this.propostas ?? [];
    const filtradas = termo
      ? list.filter(p => {
          const nome = (p.clienteNome ?? '').toLowerCase();
          const statusLabel = (STATUS_LABEL_POR_NUMERO[p.status] ?? '').toLowerCase();
          const id = (p.propostaId ?? '').toLowerCase();
          return id.includes(termo) || nome.includes(termo) || String(p.status).includes(termo) || statusLabel.includes(termo);
        })
      : [...list];
    this.propostasFiltradas$.next(filtradas);
  }

  salvarProposta(): void {
    this.erroForm = '';
    if (!this.novaPropostaForm.clienteNome.trim()) { this.erroForm = 'Nome do cliente é obrigatório.'; return; }
    if (!this.novaPropostaForm.valorCobertura || this.novaPropostaForm.valorCobertura <= 0) { this.erroForm = 'Valor deve ser maior que zero.'; return; }
    this.salvando = true;
    this.propostaService.criar(this.novaPropostaForm).subscribe({
      next: () => {
        this.salvando = false;
        this.novaPropostaForm = { clienteNome: '', valorCobertura: 0 };
        this.sucesso = 'Proposta criada com sucesso!';
        this.carregar();
        setTimeout(() => this.sucesso = '', 4000);
      },
      error: () => { this.salvando = false; this.erroForm = 'Erro ao criar proposta.'; }
    });
  }

  iniciarEdicao(proposta: Proposta): void {
    this.propostaSelecionada = proposta;
    this.edicaoClienteNome = proposta.clienteNome ?? '';
    this.edicaoValorCobertura = proposta.valorCobertura ?? 0;
    const statusNum = statusApiParaNumero(proposta.status) as StatusNumero;
    const transicoes = TRANSICOES_POR_NUMERO[statusNum] ?? [];
    this.opcoesStatusEdicaoList = transicoes.length > 0 ? [statusNum, ...transicoes] : [1, 2, 3];
    this.novoStatusStr = String(statusNum);
    this.erroForm = '';
    this.editando = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Última atualização na edição: sempre data de hoje (somente leitura); ao salvar o backend grava a nova data. */
  get dataEdicao(): string {
    return new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }

  confirmarEdicao(): void {
    const statusNum = Number(this.novoStatusStr);
    if (!this.propostaSelecionada || !statusNum || statusNum < 1 || statusNum > 4) return;
    this.erroForm = '';
    if (!this.edicaoClienteNome.trim()) { this.erroForm = 'Nome do cliente é obrigatório.'; return; }
    if (this.edicaoValorCobertura <= 0) { this.erroForm = 'Valor deve ser maior que zero.'; return; }
    this.atualizandoStatus = true;
    this.propostaService.atualizarProposta(this.propostaSelecionada.propostaId, {
      clienteNome: this.edicaoClienteNome.trim(),
      valorCobertura: this.edicaoValorCobertura,
      status: statusNum as StatusNumero
    }).subscribe({
      next: () => {
        this.atualizandoStatus = false;
        this.sucesso = 'Proposta atualizada com sucesso!';
        this.cancelarForm();
        this.carregar();
        setTimeout(() => this.sucesso = '', 4000);
      },
      error: (err) => {
        this.atualizandoStatus = false;
        this.erro = err?.error ?? err?.message ?? 'Erro ao atualizar proposta.';
        setTimeout(() => this.erro = '', 5000);
      }
    });
  }

  cancelarForm(): void {
    this.editando = false;
    this.propostaSelecionada = null;
    this.edicaoClienteNome = '';
    this.edicaoValorCobertura = 0;
    this.novoStatusStr = '';
    this.opcoesStatusEdicaoList = [];
    this.erroForm = '';
    this.novaPropostaForm = { clienteNome: '', valorCobertura: 0 };
  }

  getStatusClass(status: StatusNumero): string {
    const map: Record<StatusNumero, string> = { 1: 'badge-analise', 2: 'badge-aprovada', 3: 'badge-rejeitada', 4: 'badge-contratada' };
    return map[status] ?? '';
  }

  /** Classe da linha do grid por status (amarelo, verde, vermelho, azul). */
  getRowStatusClass(status: StatusNumero): string {
    const map: Record<StatusNumero, string> = { 1: 'row-status-analise', 2: 'row-status-aprovada', 3: 'row-status-rejeitada', 4: 'row-status-contratada' };
    return map[status] ?? '';
  }

  podeAlterar(status: StatusNumero): boolean {
    return (TRANSICOES_POR_NUMERO[status] ?? []).length > 0;
  }

  podeExcluir(status: StatusNumero): boolean {
    return status !== 4;
  }

  abrirModalExcluir(p: Proposta): void {
    this.propostaAExcluir = p;
    this.modalExcluirAberto = true;
  }

  fecharModalExcluir(): void {
    this.modalExcluirAberto = false;
    this.propostaAExcluir = null;
  }

  confirmarExcluir(): void {
    const p = this.propostaAExcluir;
    this.fecharModalExcluir();
    if (!p) return;
    this.propostaService.excluir(p.propostaId).subscribe({
      next: () => {
        this.sucesso = 'Proposta excluída com sucesso.';
        this.carregar();
        setTimeout(() => this.sucesso = '', 4000);
      },
      error: (err) => {
        this.erro = err?.error ?? 'Erro ao excluir proposta.';
        setTimeout(() => this.erro = '', 5000);
      }
    });
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatarData(data: string | null): string {
    if (!data) return '-';
    return new Date(data).toLocaleString('pt-BR');
  }

  fecharErro(): void { this.erro = ''; }
  fecharSucesso(): void { this.sucesso = ''; }
}
