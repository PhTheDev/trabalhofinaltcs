import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDb } from '../hooks/useDb';
import { getSession } from '../services/authService';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { usuarioService } from '../services/usuarioService';
import type { ICurso } from '../types';

export const byId = <T extends { id: number }>(arr: T[], id: number | string): T | undefined => arr.find(i => String(i.id) === String(id));

export const AlunoDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);
  const dbState = useDb(refreshTrigger);

  // Obter sessão
  const session = getSession();
  const userId = session?.id || 0;
  const userName = session?.nomeCompleto || 'Aluno';
  const userRole = session?.role || 'aluno';

  // Estados locais
  const [selectedCurso, setSelectedCurso] = useState<ICurso | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Cartão' | 'Boleto'>('PIX');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Utilitários de verificação
  const isMatriculado = (cursoId: number) => {
    return dbState.matriculas.some(
      m => String(m.idUsuario) === String(userId) && String(m.idCurso) === String(cursoId)
    );
  };

  const getProgressoCurso = (cursoId: number) => {
    const modulos = dbState.modulos.filter(m => String(m.idCurso) === String(cursoId));
    const idAulas = dbState.aulas
      .filter(a => modulos.some(m => String(m.id) === String(a.idModulo)))
      .map(a => a.id);

    if (idAulas.length === 0) return 0;

    const concluidas = dbState.progressoAulas.filter(
      p => String(p.idUsuario) === String(userId) &&
           idAulas.includes(p.idAula) &&
           p.status === 'Concluído'
    ).length;

    return Math.round((concluidas / idAulas.length) * 100);
  };

  const formatPreco = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Handlers
  const handleAssistirClick = (cursoId: number) => {
    navigate(`/player/${cursoId}`);
  };

  const handleComprarClick = (curso: ICurso) => {
    setSelectedCurso(curso);
    setPaymentMethod('PIX');
    // Abre o modal via React, ou via Bootstrap Modal JS
    const modalEl = document.getElementById('checkoutModal');
    if (modalEl) {
      const bootstrap = (window as any).bootstrap;
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  };

  const handleConfirmarCompra = async () => {
    if (!selectedCurso || !userId) return;

    const preco = Number(selectedCurso.preco) || 0;

    try {
      // 1. Matrícula
      await usuarioService.matricular(userId, selectedCurso.id);

      // 2. Pagamento
      if (preco > 0) {
        await fetch('http://localhost:3000/pagamentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idAssinatura: null,
            valorPago: preco,
            dataPagamento: new Date().toISOString(),
            metodoPagamento: paymentMethod,
            idTransacaoGateway: `TXN-${Date.now().toString(36).toUpperCase()}`
          })
        });
      }

      // Fecha modal
      const modalEl = document.getElementById('checkoutModal');
      if (modalEl) {
        const bootstrap = (window as any).bootstrap;
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();
      }

      // Feedback
      showToast(
        preco > 0
          ? `Compra realizada! ${formatPreco(preco)} via ${paymentMethod}`
          : 'Inscrição confirmada!'
      );

      setSelectedCurso(null);
      triggerRefresh();
    } catch (e: any) {
      showToast('Erro ao processar compra/matrícula.');
    }
  };

  return (
    <>
      <Navbar userName={userName} role={userRole} />

      <main className="container py-4">
        <header className="mb-5 hero-panel p-4 p-md-5">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <h1 className="h3 mb-1 mt-2">
                <i className="bi bi-collection-play-fill me-2 text-accent"></i>Meus Cursos
              </h1>
              <p className="text-secondary mb-0">Explore o catálogo e continue de onde parou.</p>
            </div>
            <span className="badge text-bg-primary p-2 fs-6">
              <i className="bi bi-mortarboard me-1"></i>Área do Aluno
            </span>
          </div>
        </header>

        <div className="row g-4">
          {dbState.cursos.length === 0 ? (
            <div className="col-12 text-center text-muted py-5">
              <i className="bi bi-collection-play fs-1 d-block mb-3 opacity-50"></i>
              <p>Nenhum curso disponível no momento.</p>
            </div>
          ) : (
            dbState.cursos.map(curso => {
              const matriculado = isMatriculado(curso.id);
              const progresso = matriculado ? getProgressoCurso(curso.id) : 0;
              const instrutor = byId(dbState.usuarios, curso.idInstrutor);
              const categoria = byId(dbState.categorias, curso.idCategoria);
              const aulas = dbState.aulas.filter(a =>
                dbState.modulos.filter(m => String(m.idCurso) === String(curso.id)).some(m => String(m.id) === String(a.idModulo))
              );

              const preco = Number(curso.preco) || 0;
              const gratuito = preco === 0;

              const badgeColor = {
                'Iniciante': 'success',
                'Intermediário': 'warning',
                'Avançado': 'danger'
              }[curso.nivel] || 'secondary';

              // Preço tag
              const precoTag = matriculado
                ? <span className="course-price-tag owned"><i className="bi bi-check-circle-fill me-1"></i>Adquirido</span>
                : gratuito
                  ? <span className="course-price-tag free">Gratuito</span>
                  : <span className="course-price-tag">{formatPreco(preco)}</span>;

              return (
                <div key={curso.id} className="col-12 col-md-6 col-xl-4">
                  <div className="course-card h-100">
                    <div className="course-card-header">
                      <div className="course-icon">
                        <i className="bi bi-play-circle-fill"></i>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {precoTag}
                        <span className={`badge bg-${badgeColor} bg-opacity-25 text-${badgeColor === 'warning' ? 'warning' : badgeColor} border border-${badgeColor} border-opacity-50`}>
                          {curso.nivel}
                        </span>
                      </div>
                    </div>
                    <div className="course-card-body">
                      <h3 className="course-title">{curso.titulo}</h3>
                      <p className="course-desc">{curso.descricao || ''}</p>
                      <div className="course-meta">
                        <span><i className="bi bi-person-circle me-1"></i>{instrutor?.nomeCompleto || 'Instrutor'}</span>
                        <span><i className="bi bi-tag me-1"></i>{categoria?.nome || 'Geral'}</span>
                        <span><i className="bi bi-clock me-1"></i>{curso.totalHoras}h</span>
                        <span><i className="bi bi-collection-play me-1"></i>{aulas.length} aulas</span>
                      </div>

                      {matriculado && (
                        <div className="course-progress-wrap mt-3">
                          <div className="d-flex justify-content-between mb-1">
                            <small className="text-muted">Progresso</small>
                            <small className="fw-semibold text-accent">{progresso}%</small>
                          </div>
                          <div className="progress course-progress-bar">
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{ width: `${progresso}%` }}
                              aria-valuenow={progresso}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="course-card-footer">
                      {matriculado ? (
                        <button
                          onClick={() => handleAssistirClick(curso.id)}
                          className="btn btn-primary btn-assistir w-100"
                        >
                          <i className="bi bi-play-fill me-2"></i>
                          {progresso > 0 ? 'Continuar' : 'Começar'} Curso
                        </button>
                      ) : gratuito ? (
                        <button
                          onClick={() => handleComprarClick(curso)}
                          className="btn btn-success btn-assistir w-100"
                        >
                          <i className="bi bi-unlock me-2"></i>Acessar Gratuitamente
                        </button>
                      ) : (
                        <button
                          onClick={() => handleComprarClick(curso)}
                          className="btn btn-accent btn-assistir w-100"
                        >
                          <i className="bi bi-cart-check me-2"></i>Comprar por {formatPreco(preco)}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <Footer />

      {/* Modal: Checkout */}
      <div className="modal fade" id="checkoutModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content checkout-modal-content">
            <div className="modal-header checkout-modal-header">
              <h3 className="modal-title h5">
                <i className="bi bi-bag-check-fill me-2 text-accent"></i>Checkout
              </h3>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Fechar"
              ></button>
            </div>

            <div className="modal-body">
              {selectedCurso && (
                <>
                  {/* Resumo do curso */}
                  <div className="checkout-course-summary">
                    <div className="d-flex align-items-start gap-3">
                      <div className="checkout-icon">
                        <i className="bi bi-play-circle-fill"></i>
                      </div>
                      <div className="flex-grow-1">
                        <h4 className="checkout-curso-name">{selectedCurso.titulo}</h4>
                        <p className="checkout-curso-desc mb-2">{selectedCurso.descricao || ''}</p>
                        <div className="d-flex gap-3 text-muted small">
                          <span>
                            <i className="bi bi-bar-chart me-1"></i>
                            {selectedCurso.nivel}
                          </span>
                          <span>
                            <i className="bi bi-clock me-1"></i>
                            {selectedCurso.totalHoras}h
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Método de pagamento */}
                  {Number(selectedCurso.preco) > 0 && (
                    <div className="checkout-pay-section mt-3">
                      <label className="form-label small text-muted mb-2">Método de pagamento</label>
                      <div className="checkout-methods">
                        {(['PIX', 'Cartão', 'Boleto'] as const).map(method => (
                          <label key={method} className="checkout-method-option">
                            <input
                              type="radio"
                              name="checkoutMetodoRadio"
                              value={method}
                              checked={paymentMethod === method}
                              onChange={() => setPaymentMethod(method)}
                            />
                            <span className="checkout-method-label">
                              <i className={`bi bi-${
                                method === 'PIX' ? 'qr-code' : method === 'Cartão' ? 'credit-card' : 'upc-scan'
                              } me-2`}></i>
                              {method}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="checkout-total-bar mt-3">
                    <span className="text-muted">Total</span>
                    <span className="checkout-total-value">
                      {Number(selectedCurso.preco) === 0 ? 'GRÁTIS' : formatPreco(selectedCurso.preco)}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer checkout-modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarCompra}
                className="btn btn-primary"
              >
                <i className="bi bi-shield-check me-2"></i>
                <span>
                  {selectedCurso && Number(selectedCurso.preco) === 0
                    ? 'Confirmar Inscrição'
                    : `Pagar ${selectedCurso ? formatPreco(selectedCurso.preco) : ''}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="aluno-toast show">
          <i className="bi bi-check-circle-fill me-2"></i>
          {toastMessage}
        </div>
      )}
    </>
  );
};
