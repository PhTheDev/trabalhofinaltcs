import React from 'react';

type FeedbackStateProps = {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  empty?: boolean;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  children: React.ReactNode;
};

export const FeedbackState: React.FC<FeedbackStateProps> = ({
  loading,
  error,
  onRetry,
  empty = false,
  emptyIcon = 'bi-inbox',
  emptyTitle = 'Nada por aqui',
  emptyMessage = 'Não há itens para exibir no momento.',
  children,
}) => {
  if (loading) {
    return (
      <div className="col-12 text-center text-muted py-5" role="status" aria-live="polite">
        <div className="spinner-border text-info mb-3" aria-hidden="true"></div>
        <p className="mb-0">Carregando dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-12 text-center py-5" role="alert">
        <i className="bi bi-wifi-off fs-1 d-block mb-3 text-warning"></i>
        <p className="mb-3">{error}</p>
        {onRetry && (
          <button type="button" className="btn btn-outline-info" onClick={onRetry}>
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="col-12 text-center text-muted py-5">
        <i className={`bi ${emptyIcon} fs-1 d-block mb-3 opacity-50`}></i>
        <p className="fw-semibold mb-1">{emptyTitle}</p>
        <p className="mb-0">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
};
