import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { timeout, catchError, of } from 'rxjs';
import { PropostaService } from '../../services/proposta.service';
import { Proposta, CriarPropostaDto, STATUS_LABELS, STATUS_TRANSICOES } from '../../models/proposta.model';

@Component({
  selector: 'app-propostas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './propostas.component.html',
  styleUrls: ['./propostas.component.scss']
})
export class PropostasComponent implements OnInit {
  propostas: Proposta[] = [];
  propostasFiltradas: Proposta[] = [];
  filtro = '';
  carregando = false;
  erro = '';
  sucesso = '';

  // Formulário nova proposta
  novaPropostaForm: CriarPropostaDto = { clienteNome: '', valorCobertura: 0 };
  salvando = false;
  erroForm = '';

  // Edição de status (inline)
  editando = false;
  propostaSelecionada: Proposta | null = null;
  novoStatus = '';
  statusDisponiveis: string[] = [];
  atualizandoStatus = false;

  statusLabels = STATUS_LABELS;

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
        this.carregando = false;
        return of([]);
      })
    ).subscribe(data => {
      this.propostas = Array.isArray(data) ? data : [];
      this.aplicarFiltro();
      this.carregando = false;
    });
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
    this.statusDisponiveis = STATUS_TRANSICOES[proposta.status] ?? [];
    this.novoStatus = '';
    this.erroForm = '';
    this.editando = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  confirmarStatus(): void {
    if (!this.propostaSelecionada || !this.novoStatus) return;
    this.atualizandoStatus = true;
    this.propostaService.atualizarStatus(this.propostaSelecionada.propostaId, { status: this.novoStatus }).subscribe({
      next: () => {
        this.atualizandoStatus = false;
        this.sucesso = `Status atualizado para "${STATUS_LABELS[this.novoStatus]}" com sucesso!`;
        this.cancelarForm();
        this.carregar();
        setTimeout(() => this.sucesso = '', 4000);
      },
      error: (err) => {
        this.atualizandoStatus = false;
        this.erro = err?.error ?? 'Erro ao atualizar status.';
        setTimeout(() => this.erro = '', 5000);
      }
    });
  }

  cancelarForm(): void {
    this.editando = false;
    this.propostaSelecionada = null;
    this.novoStatus = '';
    this.erroForm = '';
    this.novaPropostaForm = { clienteNome: '', valorCobertura: 0 };
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = { EmAnalise: 'badge-analise', Aprovada: 'badge-aprovada', Rejeitada: 'badge-rejeitada', Contratada: 'badge-contratada' };
    return map[status] ?? '';
  }

  /** Classe da linha do grid por status (amarelo, verde, vermelho, azul). */
  getRowStatusClass(status: string): string {
    const map: Record<string, string> = { EmAnalise: 'row-status-analise', Aprovada: 'row-status-aprovada', Rejeitada: 'row-status-rejeitada', Contratada: 'row-status-contratada' };
    return map[status] ?? '';
  }

  podeAlterar(status: string): boolean {
    return (STATUS_TRANSICOES[status] ?? []).length > 0;
  }

  podeExcluir(status: string): boolean {
    return status !== 'Contratada';
  }

  excluirProposta(p: Proposta): void {
    if (!confirm(`Excluir a proposta de "${p.clienteNome}"?`)) return;
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
