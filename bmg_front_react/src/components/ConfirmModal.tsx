import React from 'react';
import './ConfirmModal.css';

export type ConfirmModalType = 'confirmar' | 'perigo';

interface ConfirmModalProps {
  titulo?: string;
  mensagem: string;
  labelConfirmar?: string;
  labelCancelar?: string;
  tipo?: ConfirmModalType;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  titulo = 'Confirmar',
  mensagem,
  labelConfirmar = 'Confirmar',
  labelCancelar = 'Cancelar',
  tipo = 'confirmar',
  onConfirmar,
  onCancelar,
}) => {
  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div
        className="modal-box"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="modal-title">{titulo}</h3>
        <p className="modal-message">{mensagem}</p>
        <div className="modal-actions">
          <button
            type="button"
            className="btn-modal btn-cancelar"
            onClick={onCancelar}
          >
            {labelCancelar}
          </button>
          <button
            type="button"
            className={`btn-modal btn-confirmar${
              tipo === 'perigo' ? ' perigo' : ''
            }`}
            onClick={onConfirmar}
          >
            {labelConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};

