import React, { useEffect, useMemo, useState } from 'react';
import type { PropostaComContratoDto } from '../models/contratacao';
import {
  listarPropostasComContrato,
  contratarProposta,
} from '../services/contratacaoService';
import { STATUS_LABEL_POR_NUMERO, STATUS_NUMEROS } from '../models/proposta';
import type { StatusNumero } from '../models/proposta';
import { ConfirmModal } from '../components/ConfirmModal';
import './ContratacoesPage.css';

// Página de Contratações copiada do CRA e usada aqui no Vite.
export const ContratacoesPage: React.FC = () => {
  const [propostas, setPropostas] = useState<PropostaComContratoDto[]>([]);
  const [propostasFiltradas, setPropostasFiltradas] = useState<PropostaComContratoDto[]>([]);
  const [propostaSelecionada, setPropostaSelecionada] =
    useState<PropostaComContratoDto | null>(null);
  const [filtro, setFiltro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [contratandoId, setContratandoId] = useState<string | null>(null);
  const [modalContratarAberto, setModalContratarAberto] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    aplicarFiltro();
  }, [filtro, propostas]);

  async function carregar() {
    setCarregando(true);
    setErro('');
    setPropostaSelecionada(null);
    try {
      const list = await listarPropostasComContrato();
      setPropostas(list);
      setPropostasFiltradas(list);
    } catch {
      setErro(
        'Erro ou timeout ao carregar. Verifique se a API está rodando (ex.: localhost:5240).',
      );
    } finally {
      setCarregando(false);
    }
  }

  function aplicarFiltro() {
    const termo = (filtro ?? '').toLowerCase().trim();
    const list = propostas ?? [];
    if (!termo) {
      setPropostasFiltradas(list);
      return;
    }
    const filtradas = list.filter((p) => {
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
    setPropostasFiltradas(filtradas);
  }

  function selecionarProposta(p: PropostaComContratoDto) {
    setPropostaSelecionada((prev) =>
      prev?.propostaId === p.propostaId ? null : p,
    );
  }

  function labelStatus(n: number): string {
    return STATUS_LABEL_POR_NUMERO[n as StatusNumero] ?? '';
  }

  function formatarValor(valor: number): string {
    return (valor ?? 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function formatarData(data: string | null | undefined): string {
    if (data == null || data === '') return '-';
    return new Date(data).toLocaleString('pt-BR');
  }

  function getStatusClass(status: number): string {
    const map: Record<StatusNumero, string> = {
      1: 'badge-analise',
      2: 'badge-aprovada',
      3: 'badge-rejeitada',
      4: 'badge-contratada',
    };
    return map[status as StatusNumero] ?? '';
  }

  function abrirModalContratar() {
    if (propostaSelecionada?.status === 2) {
      setModalContratarAberto(true);
    }
  }

  function fecharModalContratar() {
    setModalContratarAberto(false);
  }

  async function confirmarContratar() {
    fecharModalContratar();
    if (propostaSelecionada) {
      await contratarSelecionada(propostaSelecionada);
    }
  }

  async function contratarSelecionada(p: PropostaComContratoDto) {
    setContratandoId(p.propostaId);
    setErro('');
    try {
      const res = await contratarProposta(p.propostaId);
      setContratandoId(null);
      const msgExtra = res.contratacao?.numeroContrato
        ? ` — Nº ${res.contratacao.numeroContrato}`
        : '';
      setSucesso(res.mensagem + msgExtra);
      await carregar();
      setTimeout(() => setSucesso(''), 5000);
    } catch (e: any) {
      setContratandoId(null);
      setErro(
        e?.response?.data ??
          'Erro ao contratar. Verifique se a proposta está aprovada.',
      );
      setTimeout(() => setErro(''), 5000);
    }
  }

  const mensagemModalContratar = useMemo(() => {
    if (!propostaSelecionada) {
      return 'Deseja realmente contratar esta proposta?';
    }
    return `Deseja realmente contratar a proposta de "${propostaSelecionada.clienteNome}" (${formatarValor(
      propostaSelecionada.valorCobertura,
    )})?`;
  }, [propostaSelecionada]);

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
        <h2 className="panel-title">Contratações</h2>
        <div className="panel-body">
          <div className="form-row">
            <div className="form-field">
              <label>PropostaId</label>
              <input
                type="text"
                value={propostaSelecionada?.propostaId ?? '-'}
                disabled
                className="mono-sm"
              />
            </div>
            <div className="form-field">
              <label>Cliente</label>
              <input
                type="text"
                value={propostaSelecionada?.clienteNome ?? '-'}
                disabled
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Valor Cobertura (R$)</label>
              <input
                type="text"
                value={
                  propostaSelecionada
                    ? formatarValor(propostaSelecionada.valorCobertura)
                    : '-'
                }
                disabled
              />
            </div>
            <div className="form-field">
              <label>Status</label>
              <select
                value={propostaSelecionada?.status ?? ''}
                disabled
                className="dropdown-status"
              >
                {STATUS_NUMEROS.map((n) => (
                  <option key={n} value={n}>
                    {STATUS_LABEL_POR_NUMERO[n]}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Última Atualização</label>
              <input
                type="text"
                value={formatarData(propostaSelecionada?.dataAtualizacao ?? null)}
                disabled
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Data Contratação</label>
              <input
                type="text"
                value={formatarData(propostaSelecionada?.dataContratacao)}
                disabled
              />
            </div>
            <div className="form-field">
              <label>Nº Contrato</label>
              <input
                type="text"
                value={propostaSelecionada?.numeroContrato || '-'}
                disabled
                className="mono-sm"
              />
            </div>
          </div>
          {propostaSelecionada && (
            <div className="form-actions">
              <button
                className="btn-primary"
                title="Contratar proposta (somente se status for Aprovada)"
                onClick={abrirModalContratar}
                disabled={
                  contratandoId !== null || propostaSelecionada.status !== 2
                }
              >
                {contratandoId !== propostaSelecionada.propostaId ? (
                  'Contratar'
                ) : (
                  <span className="spinner-sm" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          <span>Lista de propostas para contratação</span>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar por ID, nome ou status"
            />
          </div>
        </div>
        <p className="panel-hint">
          Somente propostas Aprovadas podem ser contratadas.
        </p>

        <div className="table-wrapper">
          <table className="data-table data-table-contratacoes">
            <thead>
              <tr>
                <th className="col-proposta-id">PropostaId</th>
                <th className="col-cliente">Cliente</th>
                <th className="col-valor">Valor Cobertura</th>
                <th className="col-status">Status</th>
                <th className="col-ultima-atualizacao">Última Atualização</th>
                <th className="col-data-contratacao">Data Contratação</th>
                <th className="col-numero-contrato">Nº Contrato</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {carregando && (
                <tr className="loading-row">
                  <td colSpan={8}>
                    <span className="spinner-dark" /> Carregando...
                  </td>
                </tr>
              )}
              {!carregando && propostasFiltradas.length === 0 && (
                <tr className="empty-row">
                  <td colSpan={8}>Nenhuma proposta encontrada.</td>
                </tr>
              )}
              {!carregando &&
                propostasFiltradas.map((p) => (
                  <tr
                    key={p.propostaId}
                    onClick={() => selecionarProposta(p)}
                    className={
                      'row-clickable' +
                      (propostaSelecionada?.propostaId === p.propostaId
                        ? ' row-selected'
                        : '')
                    }
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
                    <td>
                      {p.dataContratacao
                        ? formatarData(p.dataContratacao)
                        : '-'}
                    </td>
                    <td className="mono-sm">
                      {p.numeroContrato || '-'}
                    </td>
                    <td className="col-actions">
                      <button
                        className="btn-icon btn-edit"
                        title="Editar"
                        onClick={(e) => {
                          e.stopPropagation();
                          selecionarProposta(p);
                        }}
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalContratarAberto && (
        <ConfirmModal
          titulo="Confirmar contratação"
          mensagem={mensagemModalContratar}
          labelConfirmar="Contratar"
          labelCancelar="Cancelar"
          tipo="confirmar"
          onConfirmar={confirmarContratar}
          onCancelar={fecharModalContratar}
        />
      )}
    </div>
  );
};

