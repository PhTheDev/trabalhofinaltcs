import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDb } from '../hooks/useDb';
import { getSession } from '../services/authService';
import { usuarioService } from '../services/usuarioService';
import type { IAula, IModulo, IProgressoAula } from '../types';
import { byId, isYoutubeUrl, toYoutubeEmbed } from '../lib/utils';

export const Player: React.FC = () => {
  const { cursoId } = useParams<{ cursoId: string }>();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);
  const dbState = useDb(refreshTrigger);

  const session = getSession();
  const userId = session?.id || 0;

  const [aulaAtivaId, setAulaAtivaId] = useState<number | null>(null);
  const [savingProgress, setSavingProgress] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const curso = byId(dbState.cursos, Number(cursoId));

  const modulos = dbState.modulos
    .filter((m: IModulo) => String(m.idCurso) === String(cursoId))
    .sort((a: IModulo, b: IModulo) => a.ordem - b.ordem);

  useEffect(() => {
    if (modulos.length > 0 && aulaAtivaId === null) {
      const aulasMod = dbState.aulas
        .filter((a: IAula) => String(a.idModulo) === String(modulos[0].id))
        .sort((a: IAula, b: IAula) => a.ordem - b.ordem);

      if (aulasMod.length > 0) {
        setAulaAtivaId(aulasMod[0].id);
      }
    }
  }, [modulos, dbState.aulas, aulaAtivaId]);

  const isAulaConcluida = (aulaId: number) => {
    return dbState.progressoAulas.some(
      (p: IProgressoAula) => String(p.idUsuario) === String(userId) &&
                             String(p.idAula) === String(aulaId) &&
                             p.status === 'Concluído'
    );
  };

  const handleVoltarCatalogo = () => {
    navigate('/aluno');
  };

  const handleAulaClick = (aulaId: number) => {
    setAulaAtivaId(aulaId);
  };

  const handleMarcarConcluida = async () => {
    if (!aulaAtivaId || !userId || savingProgress) return;
    setSavingProgress(true);
    setSaveError(null);
    try {
      await usuarioService.atualizarProgresso(userId, aulaAtivaId, 'Concluído');
      triggerRefresh();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Não foi possível salvar o progresso.');
    } finally {
      setSavingProgress(false);
    }
  };

  const aulaAtiva = aulaAtivaId ? (byId(dbState.aulas, aulaAtivaId) as IAula | undefined) : null;
  const concluida = aulaAtivaId ? isAulaConcluida(aulaAtivaId) : false;
  const youtubeSrc = aulaAtiva ? toYoutubeEmbed(aulaAtiva.urlConteudo) : '';

  if (dbState.loading) {
    return (
      <div className="container py-5 text-center text-muted" role="status">
        <div className="spinner-border text-info mb-3" aria-hidden="true"></div>
        <p>Carregando aula...</p>
      </div>
    );
  }

  if (dbState.error) {
    return (
      <div className="container py-5 text-center" role="alert">
        <p>{dbState.error}</p>
        <button type="button" onClick={triggerRefresh} className="btn btn-outline-info me-2">
          Tentar novamente
        </button>
        <button type="button" onClick={handleVoltarCatalogo} className="btn btn-primary">
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="container py-5 text-center text-muted">
        <h3>Curso não encontrado.</h3>
        <button type="button" onClick={handleVoltarCatalogo} className="btn btn-primary mt-3">
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  const matriculado = dbState.matriculas.some(
    (m) => String(m.idUsuario) === String(userId) && String(m.idCurso) === String(cursoId),
  );

  if (!matriculado) {
    return (
      <div className="container py-5 text-center text-muted">
        <h3>Você ainda não está inscrito neste curso.</h3>
        <p className="mb-3">Volte ao catálogo para se inscrever e depois assistir às aulas.</p>
        <button type="button" onClick={handleVoltarCatalogo} className="btn btn-primary">
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="player-layout">
      <aside className="player-sidebar">
        <div className="sidebar-header">
          <button type="button" onClick={handleVoltarCatalogo} className="btn-back" title="Voltar ao catálogo">
            <i className="bi bi-arrow-left me-2"></i>Catálogo
          </button>
          <h2 className="sidebar-curso-titulo">{curso.titulo}</h2>
        </div>
        <div className="sidebar-content">
          {modulos.length === 0 ? (
            <div className="p-3 text-muted text-center small">Nenhum módulo cadastrado.</div>
          ) : (
            modulos.map((modulo: IModulo) => {
              const aulasMod = dbState.aulas
                .filter((a: IAula) => String(a.idModulo) === String(modulo.id))
                .sort((a: IAula, b: IAula) => a.ordem - b.ordem);

              return (
                <div key={modulo.id} className="sidebar-modulo">
                  <div className="sidebar-modulo-header">
                    <i className="bi bi-folder2 me-2"></i>
                    {modulo.titulo}
                    <span className="ms-auto badge bg-secondary bg-opacity-30 text-secondary">
                      {aulasMod.length}
                    </span>
                  </div>
                  <ul className="sidebar-aulas-list list-unstyled mb-2">
                    {aulasMod.map((aula: IAula) => {
                      const concluidaAula = isAulaConcluida(aula.id);
                      const ativa = aula.id === aulaAtivaId;

                      return (
                        <li
                          key={aula.id}
                          role="button"
                          tabIndex={0}
                          aria-current={ativa ? 'true' : undefined}
                          aria-label={aula.titulo}
                          onClick={() => handleAulaClick(aula.id)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              handleAulaClick(aula.id);
                            }
                          }}
                          className={`sidebar-aula-item ${concluidaAula ? 'concluida' : ''} ${ativa ? 'ativa' : ''}`}
                        >
                          <span className="aula-status-icon">
                            {concluidaAula ? (
                              <i className="bi bi-check-circle-fill text-success"></i>
                            ) : (
                              <i className="bi bi-play-circle text-accent"></i>
                            )}
                          </span>
                          <span className="aula-titulo">{aula.titulo}</span>
                          <span className="aula-duracao text-muted ms-auto">{aula.duracaoMinutos}min</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      </aside>

      <section className="player-main p-0 border-0 bg-transparent shadow-none">
        <div className="player-top-bar px-4 py-3">
          <h3 className="player-aula-titulo m-0">
            {aulaAtiva ? aulaAtiva.titulo : 'Selecione uma aula'}
          </h3>
          {aulaAtiva && (
            <div className="d-flex flex-column align-items-end gap-1">
              <button
                type="button"
                onClick={handleMarcarConcluida}
                disabled={concluida || savingProgress}
                className={`btn btn-sm ${concluida ? 'btn-success' : 'btn-outline-success'}`}
                aria-busy={savingProgress}
              >
                {concluida ? (
                  <>
                    <i className="bi bi-check-circle-fill me-2"></i>Concluída
                  </>
                ) : savingProgress ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>Marcar como concluída
                  </>
                )}
              </button>
              {saveError && (
                <small className="text-danger" role="alert">{saveError}</small>
              )}
            </div>
          )}
        </div>

        <div className="player-content">
          {aulaAtiva ? (
            isYoutubeUrl(aulaAtiva.urlConteudo) ? (
              <iframe
                src={youtubeSrc}
                className="player-iframe"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title={aulaAtiva.titulo}
              ></iframe>
            ) : (
              <video key={aulaAtiva.id} className="player-video" controls>
                <source src={aulaAtiva.urlConteudo} />
                Seu browser não suporta vídeo HTML5.
              </video>
            )
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted gap-3">
              <i className="bi bi-play-circle fs-1 opacity-50"></i>
              <p className="mb-0">Selecione uma aula na lista ao lado</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
