import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { login, cadastrarAluno, getSession } from '../services/authService';// Esquemas de Validação com Zod
const loginSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('Digite um e-mail válido'),
  senha: z.string().min(3, 'A senha deve ter pelo menos 3 caracteres')
});

const cadastroSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.string().min(1, 'E-mail é obrigatório').email('Digite um e-mail válido'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres')
});

export const Login: React.FC = () => {
  const navigate = useNavigate();

  // Se já há sessão ativa, redireciona direto
  useEffect(() => {
    const session = getSession();
    if (session) {
      navigate(session.role === 'admin' ? '/admin' : '/aluno');
    }
  }, [navigate]);

  // Estados locais
  const [activeTab, setActiveTab] = useState<'login' | 'cadastro'>('login');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados do formulário de login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  // Estados do formulário de cadastro
  const [cadastroNome, setCadastroNome] = useState('');
  const [cadastroEmail, setCadastroEmail] = useState('');
  const [cadastroSenha, setCadastroSenha] = useState('');

  // Mensagens de alerta
  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'warning'; message: string } | null>(null);

  const triggerAlert = (message: string, type: 'success' | 'danger' | 'warning' = 'danger') => {
    setAlert({ type, message });
  };

  const clearAlert = () => setAlert(null);

  // Toggle de visibilidade da senha
  const togglePasswordVisibility = () => setShowSenha(!showSenha);

  // Botões de demonstração
  const handleDemoClick = (email: string, senha: string) => {
    setLoginEmail(email);
    setLoginSenha(senha);
    setActiveTab('login');
    clearAlert();
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlert();

    // Validação Zod
    const validation = loginSchema.safeParse({ email: loginEmail, senha: loginSenha });
    if (!validation.success) {
      triggerAlert(validation.error.issues[0].message, 'warning');
      return;
    }

    setLoading(true);

    const result = await login(loginEmail, loginSenha);
    setLoading(false);

    if (!result.ok || !result.usuario) {
      triggerAlert(result.message || 'Erro de autenticação.', 'danger');
      return;
    }

    navigate(result.usuario.role === 'admin' ? '/admin' : '/aluno');
  };

  // Submit Cadastro
  const handleCadastroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlert();

    // Validação Zod
    const validation = cadastroSchema.safeParse({
      nome: cadastroNome,
      email: cadastroEmail,
      senha: cadastroSenha
    });
    if (!validation.success) {
      triggerAlert(validation.error.issues[0].message, 'warning');
      return;
    }

    setLoading(true);

    const result = await cadastrarAluno(cadastroNome, cadastroEmail, cadastroSenha);
    setLoading(false);

    if (!result.ok || !result.usuario) {
      triggerAlert(result.message || 'Erro ao cadastrar.', 'danger');
      return;
    }

    navigate('/aluno');
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="login-body">
      {/* Orbs de fundo decorativos */}
      <div className="login-orb login-orb-1" aria-hidden="true"></div>
      <div className="login-orb login-orb-2" aria-hidden="true"></div>
      <div className="login-orb login-orb-3" aria-hidden="true"></div>

      <div className="login-wrapper">
        {/* Cabeçalho da marca */}
        <div className="login-brand-header text-center mb-4">
          <div className="login-logo">
            <span className="brand-accent">&lt;/</span>
            <span className="brand-name">PH</span>
            <span className="brand-accent">&gt;</span>
          </div>
          <p className="login-tagline">Plataforma de Cursos Online</p>
        </div>

        {/* Card de Login / Cadastro */}
        <div className="login-card">
          {/* Tabs */}
          <div className="login-tabs" role="tablist">
            <button
              onClick={() => { setActiveTab('login'); clearAlert(); }}
              className={`login-tab ${activeTab === 'login' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'login'}
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>Entrar
            </button>
            <button
              onClick={() => { setActiveTab('cadastro'); clearAlert(); }}
              className={`login-tab ${activeTab === 'cadastro' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'cadastro'}
            >
              <i className="bi bi-person-plus me-2"></i>Criar conta
            </button>
          </div>

          {/* Alerta de erro/sucesso */}
          {alert && (
            <div className={`login-alert login-alert-${alert.type}`} role="alert">
              <i className={`bi bi-${
                alert.type === 'success' ? 'check-circle-fill' : alert.type === 'warning' ? 'info-circle-fill' : 'exclamation-triangle-fill'
              } me-2`}></i>
              {alert.message}
            </div>
          )}

          {/* Painel: Login */}
          {activeTab === 'login' && (
            <div role="tabpanel">
              <form onSubmit={handleLoginSubmit} className="login-form" noValidate>
                <div className="form-group-float">
                  <i className="bi bi-envelope field-icon"></i>
                  <input
                    id="login-email"
                    type="email"
                    className="form-control login-input"
                    placeholder=" "
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                  <label htmlFor="login-email" className="form-label login-label">E-mail</label>
                </div>

                <div className="form-group-float">
                  <i className="bi bi-lock field-icon"></i>
                  <input
                    id="login-senha"
                    type={showSenha ? 'text' : 'password'}
                    className="form-control login-input"
                    placeholder=" "
                    value={loginSenha}
                    onChange={e => setLoginSenha(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <label htmlFor="login-senha" className="form-label login-label">Senha</label>
                  <button
                    type="button"
                    className="btn-toggle-pass"
                    onClick={togglePasswordVisibility}
                    aria-label="Mostrar/ocultar senha"
                  >
                    <i className={`bi bi-${showSenha ? 'eye-slash' : 'eye'}`}></i>
                  </button>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-100 login-submit" aria-busy={loading}>
                  {!loading && (
                    <span className="btn-label">
                      <i className="bi bi-box-arrow-in-right me-2"></i>Entrar
                    </span>
                  )}
                  {loading && <span className="spinner-border spinner-border-sm" role="status"></span>}
                </button>
              </form>

              <div className="login-hint mt-4">
                <p className="text-muted small mb-1">
                  <i className="bi bi-info-circle me-1"></i>Contas de demonstração:
                </p>
                <div className="demo-accounts">
                  <button
                    onClick={() => handleDemoClick('admin@plataforma.com', '0202')}
                    className="demo-btn"
                  >
                    <i className="bi bi-shield-fill-check me-1 text-accent"></i>Admin
                  </button>
                  <button
                    onClick={() => handleDemoClick('aluno@plataforma.com', '0202')}
                    className="demo-btn"
                  >
                    <i className="bi bi-person-circle me-1"></i>Aluno
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Painel: Cadastro */}
          {activeTab === 'cadastro' && (
            <div role="tabpanel">
              <form onSubmit={handleCadastroSubmit} className="login-form" noValidate>
                <div className="form-group-float">
                  <i className="bi bi-person field-icon"></i>
                  <input
                    id="cadastro-nome"
                    type="text"
                    className="form-control login-input"
                    placeholder=" "
                    value={cadastroNome}
                    onChange={e => setCadastroNome(e.target.value)}
                    autoComplete="name"
                    required
                  />
                  <label htmlFor="cadastro-nome" className="form-label login-label">Nome completo</label>
                </div>

                <div className="form-group-float">
                  <i className="bi bi-envelope field-icon"></i>
                  <input
                    id="cadastro-email"
                    type="email"
                    className="form-control login-input"
                    placeholder=" "
                    value={cadastroEmail}
                    onChange={e => setCadastroEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                  <label htmlFor="cadastro-email" className="form-label login-label">E-mail</label>
                </div>

                <div className="form-group-float">
                  <i className="bi bi-lock field-icon"></i>
                  <input
                    id="cadastro-senha"
                    type={showSenha ? 'text' : 'password'}
                    className="form-control login-input"
                    placeholder=" "
                    value={cadastroSenha}
                    onChange={e => setCadastroSenha(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <label htmlFor="cadastro-senha" className="form-label login-label">Senha (mín. 6 caracteres)</label>
                  <button
                    type="button"
                    className="btn-toggle-pass"
                    onClick={togglePasswordVisibility}
                    aria-label="Mostrar/ocultar senha"
                  >
                    <i className={`bi bi-${showSenha ? 'eye-slash' : 'eye'}`}></i>
                  </button>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-100 login-submit" aria-busy={loading}>
                  {!loading && (
                    <span className="btn-label">
                      <i className="bi bi-person-check me-2"></i>Criar conta
                    </span>
                  )}
                  {loading && <span className="spinner-border spinner-border-sm" role="status"></span>}
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-muted small mt-4">
          © {currentYear} Pedro Henrique &nbsp;·&nbsp; Engenharia da Computação — 7° período
        </p>
      </div>
    </div>
  );
};
