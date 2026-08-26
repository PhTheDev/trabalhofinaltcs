import React, { useState } from 'react';
import { useDb } from '../hooks/useDb';
import { getSession } from '../services/authService';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AcademicoService } from '../services/academicoService';
import { ConteudoService } from '../services/conteudoService';
import { usuarioService } from '../services/usuarioService';
import { financeiroService } from '../services/financeiroService';
import type { ICertificado } from '../types';
import { byId } from '../lib/utils';

const acadSvc = new AcademicoService();
const contSvc = new ConteudoService();
const formatDate = (iso: string) => new Date(iso).toLocaleString('pt-BR');

export const AdminDashboard: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);
  const dbState = useDb(refreshTrigger);

  // Obter sessão
  const session = getSession();
  const userName = session?.nomeCompleto || 'Admin';
  const userRole = session?.role || 'admin';

  // Tabs de navegação
  const [activeTab, setActiveTab] = useState<'academico' | 'conteudo' | 'usuarios' | 'financeiro'>('academico');

  // Mensagens do sistema (Toasts / Alertas)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  // ── ESTADOS DOS FORMULÁRIOS ───────────────────────────────────────────

  // 1. Acadêmico - Categoria
  const [catNome, setCatNome] = useState('');
  const [catDescricao, setCatDescricao] = useState('');

  // 2. Acadêmico - Curso
  const [cursoTitulo, setCursoTitulo] = useState('');
  const [cursoDescricao, setCursoDescricao] = useState('');
  const [cursoInstrutorId, setCursoInstrutorId] = useState('');
  const [cursoCategoriaId, setCursoCategoriaId] = useState('');
  const [cursoNivel, setCursoNivel] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Iniciante');
  const [cursoHoras, setCursoHoras] = useState('');
  const [cursoData, setCursoData] = useState(new Date().toISOString().slice(0, 10));
  const [cursoPreco, setCursoPreco] = useState('');

  // 3. Acadêmico - Filtro Cursos
  const [filtroCatId, setFiltroCatId] = useState('');
  const [cursosFiltrados, setCursosFiltrados] = useState<any[]>([]);

  // 4. Acadêmico - Trilha
  const [trilhaTitulo, setTrilhaTitulo] = useState('');
  const [trilhaDescricao, setTrilhaDescricao] = useState('');
  const [trilhaCatId, setTrilhaCatId] = useState('');

  // 5. Acadêmico - Associação Trilha-Curso
  const [assocTrilhaId, setAssocTrilhaId] = useState('');
  const [assocCursoId, setAssocCursoId] = useState('');
  const [assocOrdem, setAssocOrdem] = useState('');

  // 6. Conteúdo - Módulo
  const [modCursoId, setModCursoId] = useState('');
  const [modTitulo, setModTitulo] = useState('');
  const [modOrdem, setModOrdem] = useState('');

  // 7. Conteúdo - Aula
  const [aulaModuloId, setAulaModuloId] = useState('');
  const [aulaTitulo, setAulaTitulo] = useState('');
  const [aulaOrdem, setAulaOrdem] = useState('');
  const [aulaTipo, setAulaTipo] = useState<'Vídeo' | 'Texto' | 'Quiz'>('Vídeo');
  const [aulaDuracao, setAulaDuracao] = useState('');
  const [aulaUrl, setAulaUrl] = useState('');

  // 8. Usuários - Cadastrar Usuário
  const [uNome, setUNome] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uSenha, setUSenha] = useState('');

  // 9. Usuários - Matrícula
  const [matUsuarioId, setMatUsuarioId] = useState('');
  const [matCursoId, setMatCursoId] = useState('');

  // 10. Usuários - Progresso
  const [progUsuarioId, setProgUsuarioId] = useState('');
  const [progAulaId, setProgAulaId] = useState('');
  const [progStatus, setProgStatus] = useState<'Concluído' | 'Em andamento'>('Concluído');

  // 11. Usuários - Emissão de Certificado
  const [certUsuarioId, setCertUsuarioId] = useState('');
  const [certCursoId, setCertCursoId] = useState('');
  const [emitidoCert, setEmitidoCert] = useState<ICertificado | null>(null);

  // 12. Financeiro - Cadastrar Plano
  const [planoNome, setPlanoNome] = useState('');
  const [planoDescricao, setPlanoDescricao] = useState('');
  const [planoPreco, setPlanoPreco] = useState('');
  const [planoDuracao, setPlanoDuracao] = useState('');

  // 13. Financeiro - Checkout
  const [checkoutUsuarioId, setCheckoutUsuarioId] = useState('');
  const [checkoutPlanoId, setCheckoutPlanoId] = useState('');
  const [checkoutMetodo, setCheckoutMetodo] = useState<'PIX' | 'Cartão' | 'Boleto'>('PIX');

  // ── SUBMITS DOS FORMULÁRIOS ───────────────────────────────────────────

  const handleSalvarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNome) return showError('O nome da categoria é obrigatório.');
    try {
      await acadSvc.salvarCategoria(catNome.trim(), catDescricao.trim());
      setCatNome('');
      setCatDescricao('');
      showToast('Categoria cadastrada com sucesso.');
      triggerRefresh();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleSalvarCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cursoTitulo || !cursoInstrutorId || !cursoCategoriaId) {
      return showError('Preencha os campos obrigatórios do curso.');
    }
    await acadSvc.salvarCurso({
      titulo: cursoTitulo.trim(),
      descricao: cursoDescricao.trim(),
      idInstrutor: Number(cursoInstrutorId),
      idCategoria: Number(cursoCategoriaId),
      nivel: cursoNivel,
      dataPublicacao: cursoData || new Date().toISOString().slice(0, 10),
      totalHoras: Number(cursoHoras || 0),
      preco: Number(cursoPreco || 0)
    });
    setCursoTitulo('');
    setCursoDescricao('');
    setCursoInstrutorId('');
    setCursoCategoriaId('');
    setCursoNivel('Iniciante');
    setCursoHoras('');
    setCursoPreco('');
    showToast('Curso cadastrado com sucesso.');
    triggerRefresh();
  };

  const handleFiltrarCursos = async () => {
    if (!filtroCatId) return showError('Selecione uma categoria para filtrar.');
    const result = await acadSvc.listarCursosPorCategoria(filtroCatId);
    setCursosFiltrados(result);
  };

  const handleSalvarTrilha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trilhaTitulo || !trilhaCatId) return showError('Preencha os campos obrigatórios da trilha.');
    await acadSvc.salvarTrilha(trilhaTitulo.trim(), trilhaDescricao.trim(), Number(trilhaCatId));
    setTrilhaTitulo('');
    setTrilhaDescricao('');
    setTrilhaCatId('');
    showToast('Trilha cadastrada com sucesso.');
    triggerRefresh();
  };

  const handleAssociarCursoTrilha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assocTrilhaId || !assocCursoId || !assocOrdem) return showError('Preencha os campos obrigatórios da associação.');
    await acadSvc.associarCursoTrilha(Number(assocTrilhaId), Number(assocCursoId), Number(assocOrdem));
    setAssocTrilhaId('');
    setAssocCursoId('');
    setAssocOrdem('');
    showToast('Curso associado à trilha.');
    triggerRefresh();
  };

  const handleSalvarModulo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modCursoId || !modTitulo || !modOrdem) return showError('Preencha os campos obrigatórios do módulo.');
    await contSvc.salvarModulo(Number(modCursoId), modTitulo.trim(), Number(modOrdem));
    setModCursoId('');
    setModTitulo('');
    setModOrdem('');
    showToast('Módulo adicionado.');
    triggerRefresh();
  };

  const handleSalvarAula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aulaModuloId || !aulaTitulo || !aulaOrdem || !aulaDuracao || !aulaUrl) {
      return showError('Preencha os campos obrigatórios da aula.');
    }
    await contSvc.salvarAula(
      Number(aulaModuloId),
      aulaTitulo.trim(),
      aulaTipo,
      aulaUrl.trim(),
      Number(aulaDuracao),
      Number(aulaOrdem)
    );
    setAulaModuloId('');
    setAulaTitulo('');
    setAulaOrdem('');
    setAulaTipo('Vídeo');
    setAulaDuracao('');
    setAulaUrl('');
    showToast('Aula adicionada.');
    triggerRefresh();
  };

  const handleCadastrarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uNome || !uEmail || !uSenha) return showError('Preencha todos os campos obrigatórios.');
    try {
      await usuarioService.salvar(uNome.trim(), uEmail.trim(), uSenha);
      setUNome('');
      setUEmail('');
      setUSenha('');
      showToast('Usuário cadastrado com sucesso.');
      triggerRefresh();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleMatricular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matUsuarioId || !matCursoId) return showError('Selecione usuário e curso.');
    await usuarioService.matricular(Number(matUsuarioId), Number(matCursoId));
    setMatUsuarioId('');
    setMatCursoId('');
    showToast('Usuário matriculado no curso.');
    triggerRefresh();
  };

  const handleAtualizarProgresso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progUsuarioId || !progAulaId) return showError('Selecione usuário e aula.');
    await usuarioService.atualizarProgresso(Number(progUsuarioId), Number(progAulaId), progStatus);
    setProgUsuarioId('');
    setProgAulaId('');
    setProgStatus('Concluído');
    showToast('Progresso de aula atualizado.');
    triggerRefresh();
  };

  const handleEmitirCertificado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certUsuarioId || !certCursoId) return showError('Selecione usuário e curso.');
    const cert = await usuarioService.emitirCertificado(Number(certUsuarioId), Number(certCursoId));
    setEmitidoCert(cert);
    showToast('Certificado emitido!');
    triggerRefresh();
  };

  const handleSalvarPlano = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planoNome || !planoPreco || !planoDuracao) return showError('Preencha os campos obrigatórios do plano.');
    await financeiroService.salvarPlano(
      planoNome.trim(),
      planoDescricao.trim(),
      Number(planoPreco),
      Number(planoDuracao)
    );
    setPlanoNome('');
    setPlanoDescricao('');
    setPlanoPreco('');
    setPlanoDuracao('');
    showToast('Plano cadastrado.');
    triggerRefresh();
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutUsuarioId || !checkoutPlanoId) return showError('Selecione usuário e plano.');
    try {
      await financeiroService.checkout(
        Number(checkoutUsuarioId),
        Number(checkoutPlanoId),
        checkoutMetodo
      );
      setCheckoutUsuarioId('');
      setCheckoutPlanoId('');
      setCheckoutMetodo('PIX');
      showToast('Checkout concluído e pagamento registrado.');
      triggerRefresh();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // Estatísticas do painel
  const totalCursos = dbState.cursos.length;
  const totalUsuarios = dbState.usuarios.length;
  const totalAulas = dbState.aulas.length;

  return (
    <>
      <Navbar userName={userName} role={userRole} />

      <main className="container-fluid px-4 py-4">
        {dbState.loading && (
          <div className="alert alert-info d-flex align-items-center gap-2" role="status">
            <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
            Sincronizando dados com o backend...
          </div>
        )}
        {dbState.error && (
          <div className="alert alert-warning d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2" role="alert">
            <span>{dbState.error}</span>
            <button type="button" className="btn btn-sm btn-outline-dark" onClick={triggerRefresh}>
              Tentar novamente
            </button>
          </div>
        )}

        {/* Toast / Alerta de Erro */}
        {errorMessage && (
          <div className="alert alert-warning alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-4" style={{ zIndex: 1100 }} role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>{errorMessage}
          </div>
        )}

        {/* Hero */}
        <header className="mb-4 hero-panel p-4">
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
            <div>
              <h1 className="h4 mb-1 mt-1">
                <i className="bi bi-shield-fill-check me-2 text-accent"></i>Painel Administrativo
              </h1>
              <p className="text-secondary mb-0 small">Gerencie categorias, cursos, conteúdo, usuários e financeiro.</p>
              <span className="admin-stat-chip mt-2" style={{ fontSize: '0.75rem', opacity: 0.75 }}>
                <i className="bi bi-hdd-network me-1"></i>Dados em tempo real no backend Nest + PostgreSQL
              </span>
            </div>
            <div className="d-flex flex-column gap-2 align-items-end">
              <div className="d-flex gap-2 flex-wrap justify-content-end">
                <div className="admin-stat-chip">
                  <i className="bi bi-journal-richtext me-1"></i>
                  <span>{totalCursos}</span> cursos
                </div>
                <div className="admin-stat-chip">
                  <i className="bi bi-people me-1"></i>
                  <span>{totalUsuarios}</span> usuários
                </div>
                <div className="admin-stat-chip">
                  <i className="bi bi-play-btn me-1"></i>
                  <span>{totalAulas}</span> aulas
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="admin-tabs-wrapper mb-4">
          <ul className="admin-tab-nav nav" id="adminTabNav" role="tablist">
            {(['academico', 'conteudo', 'usuarios', 'financeiro'] as const).map(tab => (
              <li key={tab} className="nav-item" role="presentation">
                <button
                  onClick={() => setActiveTab(tab)}
                  className={`admin-tab-btn ${activeTab === tab ? 'active' : ''}`}
                  type="button"
                >
                  {tab === 'academico' && <><i className="bi bi-mortarboard-fill"></i><span>Acadêmico</span></>}
                  {tab === 'conteudo' && <><i className="bi bi-collection-play-fill"></i><span>Conteúdo</span></>}
                  {tab === 'usuarios' && <><i className="bi bi-people-fill"></i><span>Usuários</span></>}
                  {tab === 'financeiro' && <><i className="bi bi-cash-coin"></i><span>Financeiro</span></>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* ABA 1: Acadêmico */}
          {activeTab === 'academico' && (
            <div className="tab-pane fade show active">
              <div className="row g-4">
                {/* Cadastrar Categoria */}
                <div className="col-12 col-lg-6">
                  <div className="card h-100">
                    <div className="card-header">
                      <i className="bi bi-tags me-2"></i>Cadastrar Categoria
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleSalvarCategoria} className="row g-2">
                        <div className="col-12">
                          <label className="form-label">Nome</label>
                          <input
                            className="form-control"
                            placeholder="Ex: Programação"
                            value={catNome}
                            onChange={e => setCatNome(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Descrição</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            placeholder="Breve descrição da categoria"
                            value={catDescricao}
                            onChange={e => setCatDescricao(e.target.value)}
                          />
                        </div>
                        <div className="col-12">
                          <button className="btn btn-primary w-100" type="submit">
                            <i className="bi bi-plus-circle me-2"></i>Salvar Categoria
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Cadastrar Curso */}
                <div className="col-12 col-lg-6">
                  <div className="card h-100">
                    <div className="card-header">
                      <i className="bi bi-journal-richtext me-2"></i>Cadastrar Curso
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleSalvarCurso} className="row g-2">
                        <div className="col-12">
                          <label className="form-label">Título</label>
                          <input
                            className="form-control"
                            placeholder="Ex: JavaScript para Web"
                            value={cursoTitulo}
                            onChange={e => setCursoTitulo(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Descrição</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            placeholder="Descreva o curso brevemente"
                            value={cursoDescricao}
                            onChange={e => setCursoDescricao(e.target.value)}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Instrutor</label>
                          <select
                            className="form-select"
                            value={cursoInstrutorId}
                            onChange={e => setCursoInstrutorId(e.target.value)}
                            required
                          >
                            <option value="">Selecione...</option>
                            {dbState.usuarios.filter(u => u.role === 'admin').map(u => (
                              <option key={u.id} value={u.id}>{u.nomeCompleto}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Categoria</label>
                          <select
                            className="form-select"
                            value={cursoCategoriaId}
                            onChange={e => setCursoCategoriaId(e.target.value)}
                            required
                          >
                            <option value="">Selecione...</option>
                            {dbState.categorias.map(c => (
                              <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Nível</label>
                          <select
                            className="form-select"
                            value={cursoNivel}
                            onChange={e => setCursoNivel(e.target.value as any)}
                          >
                            <option value="Iniciante">Iniciante</option>
                            <option value="Intermediário">Intermediário</option>
                            <option value="Avançado">Avançado</option>
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Horas</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            className="form-control"
                            placeholder="0"
                            value={cursoHoras}
                            onChange={e => setCursoHoras(e.target.value)}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Publicação</label>
                          <input
                            type="date"
                            className="form-control"
                            value={cursoData}
                            onChange={e => setCursoData(e.target.value)}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Preço (R$)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="form-control"
                            placeholder="0.00"
                            value={cursoPreco}
                            onChange={e => setCursoPreco(e.target.value)}
                          />
                        </div>
                        <div className="col-12">
                          <button className="btn btn-primary w-100" type="submit">
                            <i className="bi bi-plus-circle me-2"></i>Salvar Curso
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Filtrar Cursos */}
                <div className="col-12">
                  <div className="card">
                    <div className="card-header"><i className="bi bi-funnel me-2"></i>Filtrar Cursos por Categoria</div>
                    <div className="card-body">
                      <div className="row g-2 align-items-end">
                        <div className="col-12 col-md-8">
                          <label className="form-label">Categoria</label>
                          <select
                            className="form-select"
                            value={filtroCatId}
                            onChange={e => setFiltroCatId(e.target.value)}
                          >
                            <option value="">Selecione...</option>
                            {dbState.categorias.map(c => (
                              <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-12 col-md-4">
                          <button onClick={handleFiltrarCursos} className="btn btn-outline-primary w-100" type="button">
                            <i className="bi bi-search me-2"></i>Mostrar Cursos
                          </button>
                        </div>
                      </div>
                      <ul className="list-group mt-3">
                        {cursosFiltrados.length === 0 ? (
                          <li className="list-group-item text-secondary">Nenhum curso encontrado ou selecionado.</li>
                        ) : (
                          cursosFiltrados.map(curso => (
                            <li key={curso.id} className="list-group-item">
                              {curso.titulo} — {curso.nivel}
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Cadastrar Trilha */}
                <div className="col-12 col-lg-6">
                  <div className="card h-100">
                    <div className="card-header"><i className="bi bi-signpost-2 me-2"></i>Cadastrar Trilha</div>
                    <div className="card-body">
                      <form onSubmit={handleSalvarTrilha} className="row g-2">
                        <div className="col-12">
                          <label className="form-label">Título</label>
                          <input
                            className="form-control"
                            placeholder="Ex: Trilha Full Stack"
                            value={trilhaTitulo}
                            onChange={e => setTrilhaTitulo(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Descrição</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            value={trilhaDescricao}
                            onChange={e => setTrilhaDescricao(e.target.value)}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Categoria</label>
                          <select
                            className="form-select"
                            value={trilhaCatId}
                            onChange={e => setTrilhaCatId(e.target.value)}
                            required
                          >
                            <option value="">Selecione...</option>
                            {dbState.categorias.map(c => (
                              <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-12">
                          <button className="btn btn-primary w-100" type="submit">
                            <i className="bi bi-plus-circle me-2"></i>Salvar Trilha
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Associar Curso à Trilha */}
                <div className="col-12 col-lg-6">
                  <div className="card h-100">
                    <div className="card-header"><i className="bi bi-diagram-3 me-2"></i>Associar Curso à Trilha</div>
                    <div className="card-body">
                      <form onSubmit={handleAssociarCursoTrilha} className="row g-2">
                        <div className="col-md-5">
                          <label className="form-label">Trilha</label>
                          <select
                            className="form-select"
                            value={assocTrilhaId}
                            onChange={e => setAssocTrilhaId(e.target.value)}
                            required
                          >
                            <option value="">Selecione...</option>
                            {dbState.trilhas.map(t => (
                              <option key={t.id} value={t.id}>{t.titulo}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-5">
                          <label className="form-label">Curso</label>
                          <select
                            className="form-select"
                            value={assocCursoId}
                            onChange={e => setAssocCursoId(e.target.value)}
                            required
                          >
                            <option value="">Selecione...</option>
                            {dbState.cursos.map(c => (
                              <option key={c.id} value={c.id}>{c.titulo}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Ordem</label>
                          <input
                            type="number"
                            min="1"
                            className="form-control"
                            value={assocOrdem}
                            onChange={e => setAssocOrdem(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-12">
                          <button className="btn btn-primary w-100" type="submit">
                            <i className="bi bi-link-45deg me-2"></i>Associar
                          </button>
                        </div>
                      </form>
                      <ul className="list-group mt-3">
                        {dbState.trilhasCursos.length === 0 ? (
                          <li className="list-group-item text-secondary">Nenhuma associação criada.</li>
                        ) : (
                          dbState.trilhasCursos.map((assoc, idx) => {
                            const trilha = byId(dbState.trilhas, assoc.idTrilha);
                            const curso = byId(dbState.cursos, assoc.idCurso);
                            return (
                              <li key={idx} className="list-group-item">
                                {trilha?.titulo || 'Trilha'} › {curso?.titulo || 'Curso'} (Ordem {assoc.ordem})
                              </li>
                            );
                          })
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: Conteúdo */}
          {activeTab === 'conteudo' && (
            <div className="tab-pane fade show active">
              <div className="row g-4">
                {/* Adicionar Módulo */}
                <div className="col-12 col-lg-6">
                  <div className="card h-100">
                    <div className="card-header"><i className="bi bi-folder2-open me-2"></i>Adicionar Módulo</div>
                    <div className="card-body">
                      <form onSubmit={handleSalvarModulo} className="row g-2">
                        <div className="col-md-7">
                          <label className="form-label">Curso</label>
                          <select
                            className="form-select"
                            value={modCursoId}
                            onChange={e => setModCursoId(e.target.value)}
                            required
                          >
                            <option value="">Selecione...</option>
                            {dbState.cursos.map(c => (
                              <option key={c.id} value={c.id}>{c.titulo}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Título</label>
                          <input
                            className="form-control"
                            placeholder="Ex: Fundamentos"
                            value={modTitulo}
                            onChange={e => setModTitulo(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Ordem</label>
                          <input
                            type="number"
                            min="1"
                            className="form-control"
                            value={modOrdem}
                            onChange={e => setModOrdem(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-12">
                          <button className="btn btn-primary w-100" type="submit">
                            <i className="bi bi-plus-circle me-2"></i>Adicionar Módulo
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Adicionar Aula */}
                <div className="col-12 col-lg-6">
                  <div className="card h-100">
                    <div className="card-header"><i className="bi bi-play-circle me-2"></i>Adicionar Aula</div>
                    <div className="card-body">
                      <form onSubmit={handleSalvarAula} className="row g-2">
                        <div className="col-md-6">
                          <label className="form-label">Módulo</label>
                          <select
                            className="form-select"
                            value={aulaModuloId}
                            onChange={e => setAulaModuloId(e.target.value)}
                            required
                          >
                            <option value="">Selecione...</option>
                            {dbState.modulos.map(m => {
                              const curso = byId(dbState.cursos, m.idCurso);
                              return (
                                <option key={m.id} value={m.id}>
                                  {curso?.titulo ? `${curso.titulo} › ` : ''}{m.titulo}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Título</label>
                          <input
                            className="form-control"
                            placeholder="Ex: Introdução"
                            value={aulaTitulo}
                            onChange={e => setAulaTitulo(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Ordem</label>
                          <input
                            type="number"
                            min="1"
                            className="form-control"
                            value={aulaOrdem}
                            onChange={e => setAulaOrdem(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Tipo</label>
                          <select
                            className="form-select"
                            value={aulaTipo}
                            onChange={e => setAulaTipo(e.target.value as any)}
                          >
                            <option value="Vídeo">Vídeo</option>
                            <option value="Texto">Texto</option>
                            <option value="Quiz">Quiz</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Duração (min)</label>
                          <input
                            type="number"
                            min="1"
                            className="form-control"
                            value={aulaDuracao}
                            onChange={e => setAulaDuracao(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-4"></div>
                        <div className="col-12">
                          <label className="form-label">URL do Conteúdo</label>
                          <input
                            type="url"
                            className="form-control"
                            placeholder="https://www.youtube.com/embed/..."
                            value={aulaUrl}
                            onChange={e => setAulaUrl(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-12">
                          <button className="btn btn-primary w-100" type="submit">
                            <i className="bi bi-plus-circle me-2"></i>Adicionar Aula
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Tabela de Estrutura */}
                <div className="col-12">
                  <div className="card">
                    <div className="card-header"><i className="bi bi-diagram-2 me-2"></i>Estrutura dos Cursos (Módulos e Aulas)</div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-sm align-middle">
                          <thead>
                            <tr>
                              <th>Curso</th>
                              <th>Módulo</th>
                              <th>Aula</th>
                              <th>Tipo</th>
                              <th>Ordem</th>
                              <th>Duração</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dbState.modulos.map(modulo => {
                              const curso = byId(dbState.cursos, modulo.idCurso);
                              const aulas = dbState.aulas
                                .filter(a => String(a.idModulo) === String(modulo.id))
                                .sort((a, b) => a.ordem - b.ordem);
                              return { modulo, curso, aulas };
                            }).flatMap((group: any) => {
                              if (group.aulas.length === 0) {
                                return [
                                  <tr key={`mod-${group.modulo.id}`}>
                                    <td>{group.curso?.titulo || '—'}</td>
                                    <td>{group.modulo.titulo}</td>
                                    <td colSpan={4} className="text-muted small">Nenhuma aula neste módulo.</td>
                                  </tr>
                                ];
                              }
                              return group.aulas.map((aula: any, index: number) => (
                                <tr key={aula.id}>
                                  {index === 0 ? (
                                    <td rowSpan={group.aulas.length}>{group.curso?.titulo || '—'}</td>
                                  ) : null}
                                  {index === 0 ? (
                                    <td rowSpan={group.aulas.length}>{group.modulo.titulo}</td>
                                  ) : null}
                                  <td>{aula.titulo}</td>
                                  <td>{aula.tipoConteudo}</td>
                                  <td>{aula.ordem}</td>
                                  <td>{aula.duracaoMinutos} min</td>
                                </tr>
                              ));
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: Usuários */}
          {activeTab === 'usuarios' && (
            <div className="tab-pane fade show active">
              <div className="row g-4">
                {/* Cadastro de Usuário */}
                <div className="col-12 col-lg-6">
                  <div className="card h-100">
                    <div className="card-header"><i className="bi bi-person-plus me-2"></i>Cadastrar Usuário</div>
                    <div className="card-body">
                      <form onSubmit={handleCadastrarUsuario} className="row g-2">
                        <div className="col-12">
                          <label className="form-label">Nome completo</label>
                          <input
                            className="form-control"
                            placeholder="Ex: João Silva"
                            value={uNome}
                            onChange={e => setUNome(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-7">
                          <label className="form-label">E-mail</label>
                          <input
                            type="email"
                            className="form-control"
                            placeholder="joao@email.com"
                            value={uEmail}
                            onChange={e => setUEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-5">
                          <label className="form-label">Senha</label>
                          <input
                            type="password"
                            minLength={6}
                            className="form-control"
                            value={uSenha}
                            onChange={e => setUSenha(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-12">
                          <button className="btn btn-primary w-100" type="submit">
                            <i className="bi bi-person-check me-2"></i>Cadastrar Usuário
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Matrícula */}
                <div className="col-12 col-lg-6">
                  <div className="card h-100">
                    <div className="card-header"><i className="bi bi-person-check me-2"></i>Matrícula em Curso</div>
                    <div className="card-body">
                      <form onSubmit={handleMatricular} className="row g-2">
                        <div className="col-md-6">
                          <label className="form-label">Usuário</label>
                          <select
                            className="form-select"
                            value={matUsuarioId}
                            onChange={e => setMatUsuarioId(e.target.value)}
                            required
                          >
                            <option value="">Selecione...</option>
                            {dbState.usuarios.map(u => (
                              <option key={u.id} value={u.id}>{u.nomeCompleto} ({u.role})</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Curso</label>
                          <select
                            className="form-select"
                            value={matCursoId}
                            onChange={e => setMatCursoId(e.target.value)}
                            required
                          >
                            <option value="">Selecione...</option>
                            {dbState.cursos.map(c => (
                              <option key={c.id} value={c.id}>{c.titulo}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-12">
                          <button className="btn btn-primary w-100" type="submit">
                            <i className="bi bi-journal-plus me-2"></i>Matricular
                          </button>
                        </div>
                      </form>
                      <ul className="list-group mt-3">
                        {dbState.matriculas.length === 0 ? (
                          <li className="list-group-item text-secondary">Nenhuma matrícula registrada.</li>
                        ) : (
                          dbState.matriculas.map((mat, idx) => {
                            const user = byId(dbState.usuarios, mat.idUsuario);
                            const curso = byId(dbState.cursos, mat.idCurso);
                            return (
                              <li key={idx} className="list-group-item">
                                {user?.nomeCompleto || 'Usuário'} › {curso?.titulo || 'Curso'}
                              </li>
                            );
                          })
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Progresso */}
                <div className="col-12">
                  <div className="card">
                    <div className="card-header d-flex align-items-center justify-content-between">
                      <span><i className="bi bi-award me-2"></i>Controle de Progresso e Certificado</span>
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#certificadoModal"
                      >
                        <i className="bi bi-patch-check me-1"></i>Gerar Certificado
                      </button>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleAtualizarProgresso} className="row g-2 mb-3">
                        <div className="col-md-4">
                          <label className="form-label">Usuário</label>
                          <select
                            className="form-select"
                            value={progUsuarioId}
                            onChange={e => setProgUsuarioId(e.target.value)}
                            required
                          >
                            <option value="">Selecione...</option>
                            {dbState.usuarios.map(u => (
                              <option key={u.id} value={u.id}>{u.nomeCompleto}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Aula</label>
                          <select
                            className="form-select"
                            value={progAulaId}
                            onChange={e => setProgAulaId(e.target.value)}
                            required
                          >
                            <option value="">Selecione...</option>
                            {dbState.aulas.map(a => {
                              const mod = byId(dbState.modulos, a.idModulo);
                              const cur = mod ? byId(dbState.cursos, mod.idCurso) : null;
                              return (
                                <option key={a.id} value={a.id}>
                                  {cur ? `${cur.titulo} › ` : ''}{a.titulo}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Status</label>
                          <select
                            className="form-select"
                            value={progStatus}
                            onChange={e => setProgStatus(e.target.value as any)}
                          >
                            <option value="Concluído">Concluído</option>
                            <option value="Em andamento">Em andamento</option>
                          </select>
                        </div>
                        <div className="col-md-1 d-flex align-items-end">
                          <button className="btn btn-primary w-100" type="submit" title="Atualizar">
                            <i className="bi bi-check2"></i>
                          </button>
                        </div>
                      </form>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Usuário</th>
                              <th>Aula</th>
                              <th>Status</th>
                              <th>Conclusão</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dbState.progressoAulas.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="text-center text-muted">Nenhum progresso registrado.</td>
                              </tr>
                            ) : (
                              dbState.progressoAulas.map((prog, idx) => {
                                const user = byId(dbState.usuarios, prog.idUsuario);
                                const aula = byId(dbState.aulas, prog.idAula);
                                return (
                                  <tr key={idx}>
                                    <td>{user?.nomeCompleto || '—'}</td>
                                    <td>{aula?.titulo || '—'}</td>
                                    <td>
                                      <span className={`badge bg-${prog.status === 'Concluído' ? 'success' : 'warning'} bg-opacity-25 text-${prog.status === 'Concluído' ? 'success' : 'warning'}`}>
                                        {prog.status}
                                      </span>
                                    </td>
                                    <td>{formatDate(prog.dataConclusao)}</td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 4: Financeiro */}
          {activeTab === 'financeiro' && (
            <div className="tab-pane fade show active">
              <div className="row g-4">
                {/* Cadastrar Plano */}
                <div className="col-12 col-lg-4">
                  <div className="card h-100">
                    <div className="card-header"><i className="bi bi-card-checklist me-2"></i>Cadastrar Plano</div>
                    <div className="card-body">
                      <form onSubmit={handleSalvarPlano} className="row g-2">
                        <div className="col-12">
                          <label className="form-label">Nome</label>
                          <input
                            className="form-control"
                            placeholder="Ex: Mensal"
                            value={planoNome}
                            onChange={e => setPlanoNome(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Descrição</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            placeholder="Descreva o plano"
                            value={planoDescricao}
                            onChange={e => setPlanoDescricao(e.target.value)}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label">Preço (R$)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="form-control"
                            placeholder="49.90"
                            value={planoPreco}
                            onChange={e => setPlanoPreco(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label">Duração (meses)</label>
                          <input
                            type="number"
                            min="1"
                            className="form-control"
                            placeholder="1"
                            value={planoDuracao}
                            onChange={e => setPlanoDuracao(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-12">
                          <button className="btn btn-primary w-100" type="submit">
                            <i className="bi bi-plus-circle me-2"></i>Salvar Plano
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Checkout */}
                <div className="col-12 col-lg-8">
                  <div className="card h-100">
                    <div className="card-header"><i className="bi bi-bag-check me-2"></i>Checkout — Assinatura e Pagamento</div>
                    <div className="card-body">
                      <form onSubmit={handleCheckout} className="row g-2 mb-3">
                        <div className="col-md-4">
                          <label className="form-label">Usuário</label>
                          <select
                            className="form-select"
                            value={checkoutUsuarioId}
                            onChange={e => setCheckoutUsuarioId(e.target.value)}
                            required
                          >
                            <option value="">Selecione...</option>
                            {dbState.usuarios.map(u => (
                              <option key={u.id} value={u.id}>{u.nomeCompleto}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Plano</label>
                          <select
                            className="form-select"
                            value={checkoutPlanoId}
                            onChange={e => setCheckoutPlanoId(e.target.value)}
                            required
                          >
                            <option value="">Selecione...</option>
                            {dbState.planos.map(p => (
                              <option key={p.id} value={p.id}>{p.nome} (R$ {p.preco.toFixed(2)})</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Método</label>
                          <select
                            className="form-select"
                            value={checkoutMetodo}
                            onChange={e => setCheckoutMetodo(e.target.value as any)}
                          >
                            <option value="PIX">PIX</option>
                            <option value="Cartão">Cartão</option>
                            <option value="Boleto">Boleto</option>
                          </select>
                        </div>
                        <div className="col-12">
                          <button className="btn btn-primary w-100" type="submit">
                            <i className="bi bi-shield-check me-2"></i>Finalizar Checkout
                          </button>
                        </div>
                      </form>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Usuário</th>
                              <th>Plano / Curso</th>
                              <th>Valor</th>
                              <th>Método</th>
                              <th>Transação</th>
                              <th>Data</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dbState.pagamentos.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="text-center text-muted">Nenhum pagamento registrado.</td>
                              </tr>
                            ) : (
                              dbState.pagamentos.map((pag, idx) => {
                                const assinatura = pag.idAssinatura ? byId(dbState.assinaturas, pag.idAssinatura) : null;
                                const usuario = assinatura
                                  ? byId(dbState.usuarios, assinatura.idUsuario)
                                  : dbState.usuarios[0]; // fallback para compra avulsa (estático ou matriculas)
                                const plano = assinatura ? byId(dbState.planos, assinatura.idPlano) : null;

                                return (
                                  <tr key={idx}>
                                    <td>{usuario?.nomeCompleto || 'Demonstração'}</td>
                                    <td>{plano?.nome || 'Curso Avulso'}</td>
                                    <td>R$ {pag.valorPago.toFixed(2)}</td>
                                    <td>{pag.metodoPagamento}</td>
                                    <td>{pag.idTransacaoGateway}</td>
                                    <td>{formatDate(pag.dataPagamento)}</td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer isAdmin={true} />

      {/* Modal Certificado */}
      <div className="modal fade" id="certificadoModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title h5"><i className="bi bi-patch-check me-2 text-accent"></i>Emitir Certificado</h3>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEmitirCertificado} className="row g-2 mb-3">
                <div className="col-12">
                  <label className="form-label">Usuário</label>
                  <select
                    className="form-select"
                    value={certUsuarioId}
                    onChange={e => setCertUsuarioId(e.target.value)}
                    required
                  >
                    <option value="">Selecione...</option>
                    {dbState.usuarios.map(u => (
                      <option key={u.id} value={u.id}>{u.nomeCompleto}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Curso</label>
                  <select
                    className="form-select"
                    value={certCursoId}
                    onChange={e => setCertCursoId(e.target.value)}
                    required
                  >
                    <option value="">Selecione...</option>
                    {dbState.cursos.map(c => (
                      <option key={c.id} value={c.id}>{c.titulo}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <button className="btn btn-success w-100" type="submit">
                    <i className="bi bi-patch-check me-2"></i>Emitir Certificado
                  </button>
                </div>
              </form>

              <div id="certificadoOutput" className="border rounded p-3 bg-light-subtle small text-center">
                {emitidoCert ? (
                  <div>
                    <h4 className="text-accent mb-2">CERTIFICADO DE CONCLUSÃO</h4>
                    <p className="mb-1">Certificamos que</p>
                    <h5 className="text-light fw-bold mb-2">
                      {byId(dbState.usuarios, emitidoCert.idUsuario)?.nomeCompleto}
                    </h5>
                    <p className="mb-1">concluiu com sucesso o curso</p>
                    <h5 className="text-accent fw-bold mb-3">
                      {byId(dbState.cursos, emitidoCert.idCurso)?.titulo}
                    </h5>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                      <div>Chave: {emitidoCert.codigoAutenticidade}</div>
                      <div>Emissão: {formatDate(emitidoCert.dataEmissao)}</div>
                    </div>
                  </div>
                ) : (
                  'Nenhum certificado emitido nesta sessão.'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="aluno-toast show" style={{ zIndex: 1200 }}>
          <i className="bi bi-check-circle-fill me-2"></i>
          {toastMessage}
        </div>
      )}
    </>
  );
};
