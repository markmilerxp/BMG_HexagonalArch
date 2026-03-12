import React, { useEffect, useMemo, useState } from 'react';
import type {
  Proposta,
  CriarPropostaDto,
  AtualizarPropostaDto,
  StatusNumero,
} from '../models/proposta';
import {
  STATUS_LABEL_POR_NUMERO,
  STATUS_NUMEROS,
} from '../models/proposta';
import {
  listarPropostas,
  criarProposta,
  atualizarProposta,
  excluirProposta,
} from '../services/propostaService';
import { ConfirmModal } from '../components/ConfirmModal';
import './PropostasPage.css';

// Página de Propostas copiada do projeto React (CRA) e usada aqui no Vite sem mudanças.
export const PropostasPage: React.FC = () => {
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [filtro, setFiltro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [novaPropostaForm, setNovaPropostaForm] = useState<CriarPropostaDto>({
    clienteNome: '',
    valorCobertura: 0,
  });
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState('');

  const [editando, setEditando] = useState(false);
  const [propostaSelecionada, setPropostaSelecionada] = useState<Proposta | null>(
    null,
  );
  const [edicaoClienteNome, setEdicaoClienteNome] = useState('');
  const [edicaoValorCobertura, setEdicaoValorCobertura] = useState(0);
  const [novoStatusStr, setNovoStatusStr] = useState('');
  const [opcoesStatusEdicaoList, setOpcoesStatusEdicaoList] = useState<
    StatusNumero[]
  >([]);
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [propostaAExcluir, setPropostaAExcluir] = useState<Proposta | null>(null);

  const dataHoje = useMemo(
    () =>
      new Date().toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    [],
  );

  const dataEdicao = useMemo(
    () =>
      new Date().toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    [],
  );

  const statusInicialNumero: StatusNumero = 1;

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const list = await listarPropostas();
      setPropostas(list);
    } catch (e: any) {
      setErro(
        e?.name === 'CanceledError'
          ? 'Carregamento cancelado.'
          : 'Erro ao carregar propostas.',
      );
    } finally {
      setCarregando(false);
    }
  }

  const propostasFiltradas = useMemo(() => {
    const termo = (filtro ?? '').toLowerCase().trim();
    if (!termo) return propostas;
    return propostas.filter((p) => {
      const nome = (p.clienteNome ?? '').toLowerCase();
      const statusLabel =
        (STATUS_LABEL_POR_NUMERO[p.status as StatusNumero] ?? '').toLowerCase();
      const id = (p.propostaId ?? '').toLowerCase();
      return (
        id.includes(termo) ||
        nome.includes(termo) ||
        String(p.status).includes(termo) ||
        statusLabel.includes(termo)
      );
    });
  }, [filtro, propostas]);

  function labelStatus(n: StatusNumero): string {
    return STATUS_LABEL_POR_NUMERO[n] ?? '';
  }

  function formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function formatarData(data: string | null): string {
    if (!data) return '-';
    return new Date(data).toLocaleString('pt-BR');
  }

  function getStatusClass(status: StatusNumero): string {
    const map: Record<StatusNumero, string> = {
      1: 'badge-analise',
      2: 'badge-aprovada',
      3: 'badge-rejeitada',
      4: 'badge-contratada',
    };
    return map[status] ?? '';
  }

  function getRowStatusClass(status: StatusNumero): string {
    const map: Record<StatusNumero, string> = {
      1: 'row-status-analise',
      2: 'row-status-aprovada',
      3: 'row-status-rejeitada',
      4: 'row-status-contratada',
    };
    return map[status] ?? '';
  }

  function podeExcluir(status: StatusNumero): boolean {
    return status !== 4;
  }

  function iniciarEdicao(p: Proposta) {
    setPropostaSelecionada(p);
    setEdicaoClienteNome(p.clienteNome ?? '');
    setEdicaoValorCobertura(p.valorCobertura ?? 0);
    const statusNum = p.status as StatusNumero;
    const transicoesMap: Record<StatusNumero, StatusNumero[]> = {
      1: [2, 3],
      2: [1, 3],
      3: [1, 2],
      4: [],
    };
    const transicoes = transicoesMap[statusNum] ?? [];
    setOpcoesStatusEdicaoList(
      transicoes.length > 0 ? [statusNum, ...transicoes] : [1, 2, 3],
    );
    setNovoStatusStr(String(statusNum));
    setErroForm('');
    setEditando(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function salvarProposta() {
    setErroForm('');
    if (!novaPropostaForm.clienteNome.trim()) {
      setErroForm('Nome do cliente é obrigatório.');
      return;
    }
    if (!novaPropostaForm.valorCobertura || novaPropostaForm.valorCobertura <= 0) {
      setErroForm('Valor deve ser maior que zero.');
      return;
    }
    setSalvando(true);
    try {
      await criarProposta(novaPropostaForm);
      setNovaPropostaForm({ clienteNome: '', valorCobertura: 0 });
      setSucesso('Proposta criada com sucesso!');
      await carregar();
      setTimeout(() => setSucesso(''), 4000);
    } catch {
      setErroForm('Erro ao criar proposta.');
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarEdicao() {
    const statusNum = Number(novoStatusStr);
    if (!propostaSelecionada || !statusNum || statusNum < 1 || statusNum > 4) {
      return;
    }
    setErroForm('');
    if (!edicaoClienteNome.trim()) {
      setErroForm('Nome do cliente é obrigatório.');
      return;
    }
    if (edicaoValorCobertura <= 0) {
      setErroForm('Valor deve ser maior que zero.');
      return;
    }
    setAtualizandoStatus(true);
    try {
      const dto: AtualizarPropostaDto = {
        clienteNome: edicaoClienteNome.trim(),
        valorCobertura: edicaoValorCobertura,
        status: statusNum as StatusNumero,
      };
      await atualizarProposta(propostaSelecionada.propostaId, dto);
      setSucesso('Proposta atualizada com sucesso!');
      cancelarForm();
      await carregar();
      setTimeout(() => setSucesso(''), 4000);
    } catch (e: any) {
      setErro(
        e?.response?.data ??
          e?.message ??
          'Erro ao atualizar proposta.',
      );
      setTimeout(() => setErro(''), 5000);
    } finally {
      setAtualizandoStatus(false);
    }
  }

  function cancelarForm() {
    setEditando(false);
    setPropostaSelecionada(null);
    setEdicaoClienteNome('');
    setEdicaoValorCobertura(0);
    setNovoStatusStr('');
    setOpcoesStatusEdicaoList([]);
    setErroForm('');
    setNovaPropostaForm({ clienteNome: '', valorCobertura: 0 });
  }

  function abrirModalExcluir(p: Proposta) {
    setPropostaAExcluir(p);
    setModalExcluirAberto(true);
  }

  function fecharModalExcluir() {
    setModalExcluirAberto(false);
    setPropostaAExcluir(null);
  }

  async function confirmarExcluir() {
    const p = propostaAExcluir;
    fecharModalExcluir();
    if (!p) return;
    try {
      await excluirProposta(p.propostaId);
      setSucesso('Proposta excluída com sucesso.');
      await carregar();
      setTimeout(() => setSucesso(''), 4000);
    } catch (e: any) {
      setErro(
        e?.response?.data ??
          e?.message ??
          'Erro ao excluir proposta.',
      );
      setTimeout(() => setErro(''), 5000);
    }
  }

  const mensagemModalExcluir = propostaAExcluir
    ? `Excluir a proposta de "${propostaAExcluir.clienteNome}"?`
    : '';

  return (
    <div className="page-container">
      {sucesso && (
        <div className="alert alert-success">
          {sucesso}
          <button className="alert-close" onClick={() => setSucesso('')}>
            ×
          </button>
        </div>
      )}
      {erro && (
        <div className="alert alert-error">
          {erro}
          <button className="alert-close" onClick={() => setErro('')}>
            ×
          </button>
        </div>
      )}

      <div className="panel">
        <h2 className="panel-title">
          {editando ? 'Alterar Status da Proposta' : 'Create Proposta'}
        </h2>
        <div className="panel-body">
          {!editando && (
            <>
              <div className="form-row">
                <div className="form-field">
                  <label>ID da Proposta</label>
                  <input type="text" value="(será gerado ao salvar)" disabled />
                </div>
                <div className="form-field">
                  <label>
                    Nome do Cliente <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={novaPropostaForm.clienteNome}
                    onChange={(e) =>
                      setNovaPropostaForm((prev) => ({
                        ...prev,
                        clienteNome: e.target.value,
                      }))
                    }
                    placeholder="Nome completo do cliente"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>
                    Valor da Cobertura (R$) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    value={novaPropostaForm.valorCobertura}
                    min={0.01}
                    step={0.01}
                    onChange={(e) =>
                      setNovaPropostaForm((prev) => ({
                        ...prev,
                        valorCobertura: Number(e.target.value),
                      }))
                    }
                    placeholder="Ex: 50000.00"
                  />
                </div>
                <div className="form-field">
                  <label>Status</label>
                  <select
                    className="dropdown-status"
                    value={statusInicialNumero}
                    disabled
                  >
                    {STATUS_NUMEROS.map((n) => (
                      <option key={n} value={n} disabled={n !== 1}>
                        {labelStatus(n)}
                        {n === 1 ? ' (inicial)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Última Atualização</label>
                  <input type="text" value={dataHoje} disabled />
                </div>
              </div>
              {erroForm && (
                <div
                  className="alert alert-error"
                  style={{ marginBottom: 12 }}
                >
                  {erroForm}
                </div>
              )}
              <div className="form-actions">
                <button
                  className="btn-primary"
                  onClick={salvarProposta}
                  disabled={salvando}
                >
                  {!salvando ? 'Create' : <span className="spinner-sm" />}
                </button>
                <button className="btn-secondary" onClick={cancelarForm}>
                  Cancel
                </button>
              </div>
            </>
          )}

          {editando && propostaSelecionada && (
            <>
              <div className="form-row">
                <div className="form-field">
                  <label>ID da Proposta</label>
                  <input
                    type="text"
                    value={propostaSelecionada.propostaId}
                    disabled
                    className="mono-sm"
                  />
                </div>
                <div className="form-field">
                  <label>
                    Nome do Cliente <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={edicaoClienteNome}
                    onChange={(e) => setEdicaoClienteNome(e.target.value)}
                    placeholder="Nome completo do cliente"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>
                    Valor da Cobertura (R$) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    value={edicaoValorCobertura}
                    min={0.01}
                    step={0.01}
                    onChange={(e) =>
                      setEdicaoValorCobertura(Number(e.target.value))
                    }
                    placeholder="Ex: 50000.00"
                  />
                </div>
                <div className="form-field">
                  <label>Status Atual</label>
                  <select
                    className="dropdown-status"
                    value={propostaSelecionada.status}
                    disabled
                  >
                    {STATUS_NUMEROS.map((n) => (
                      <option key={n} value={n}>
                        {labelStatus(n)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Última Atualização</label>
                  <input
                    type="text"
                    value={dataEdicao}
                    disabled
                    title="Atualizada ao salvar"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>
                    Novo Status <span className="required">*</span>
                  </label>
                  <select
                    id="novoStatusSelect"
                    className="dropdown-status"
                    value={novoStatusStr}
                    onChange={(e) => setNovoStatusStr(e.target.value)}
                  >
                    {opcoesStatusEdicaoList.map((n) => (
                      <option key={n} value={n}>
                        {labelStatus(n)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {erroForm && (
                <div
                  className="alert alert-error"
                  style={{ marginBottom: 12 }}
                >
                  {erroForm}
                </div>
              )}
              <div className="form-actions">
                <button
                  className="btn-primary"
                  onClick={confirmarEdicao}
                  disabled={atualizandoStatus}
                >
                  {!atualizandoStatus ? 'Confirmar' : <span className="spinner-sm" />}
                </button>
                <button className="btn-secondary" onClick={cancelarForm}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          <span>Propostas List</span>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar por ID, nome ou status (Em Análise, Aprovada, Rejeitada, Contratada)"
            />
          </div>
        </div>
        <p className="panel-hint">
          Só é possível excluir propostas com status diferente de Contratada.
        </p>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th className="col-id">ID</th>
                <th>Cliente</th>
                <th>Valor Cobertura</th>
                <th>Status</th>
                <th>Última Atualização</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {carregando && (
                <tr className="loading-row">
                  <td colSpan={6}>
                    <span className="spinner-dark" /> Carregando...
                  </td>
                </tr>
              )}
              {!carregando && propostasFiltradas.length === 0 && (
                <tr className="empty-row">
                  <td colSpan={6}>Nenhuma proposta encontrada.</td>
                </tr>
              )}
              {!carregando &&
                propostasFiltradas.map((p) => (
                  <tr
                    key={p.propostaId}
                    className={getRowStatusClass(p.status)}
                  >
                    <td className="mono-sm">{p.propostaId}</td>
                    <td>{p.clienteNome}</td>
                    <td>{formatarValor(p.valorCobertura)}</td>
                    <td>
                      <span
                        className={`badge ${getStatusClass(p.status)}`}
                      >
                        {labelStatus(p.status)}
                      </span>
                    </td>
                    <td>{formatarData(p.dataAtualizacao)}</td>
                    <td className="col-actions">
                      <div className="actions-group">
                        <button
                          className="btn-icon btn-edit"
                          title="Alterar status"
                          onClick={() => iniciarEdicao(p)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          title="Excluir (somente se status for diferente de Contratada)"
                          onClick={() => abrirModalExcluir(p)}
                          disabled={!podeExcluir(p.status)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalExcluirAberto && propostaAExcluir && (
        <ConfirmModal
          titulo="Excluir proposta"
          mensagem={mensagemModalExcluir}
          labelConfirmar="Excluir"
          labelCancelar="Cancelar"
          tipo="perigo"
          onConfirmar={confirmarExcluir}
          onCancelar={fecharModalExcluir}
        />
      )}
    </div>
  );
};

