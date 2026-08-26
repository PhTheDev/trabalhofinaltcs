import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/authService';

interface NavbarProps {
  userName: string;
  role: 'aluno' | 'admin';
}

export const Navbar: React.FC<NavbarProps> = ({ userName, role }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isUserAdmin = role === 'admin';
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <nav className="app-header is-scrolled">
      <div className="container-fluid px-4 app-header-inner">
        <Link className="app-brand" to={isUserAdmin ? "/admin" : "/aluno"} aria-label={isUserAdmin ? "Painel Admin" : "Meus cursos"}>
          <span className="brand-accent">&lt;/</span>
          <span className="brand-name">PH</span>
          <span className="brand-accent">&gt;</span>
          {isUserAdmin && <span className="admin-badge ms-2">Admin</span>}
        </Link>

        <div className="d-flex align-items-center gap-3">
          {isUserAdmin && (
            isAdminPage ? (
              <Link to="/aluno" className="header-link d-none d-md-inline-flex" title="Ver área do aluno">
                <i className="bi bi-person-video3 me-1"></i>
                <span>Área do Aluno</span>
              </Link>
            ) : (
              <Link to="/admin" className="header-link" title="Painel Admin">
                <i className="bi bi-shield-fill-check text-accent me-1"></i>
                <span>Painel Admin</span>
              </Link>
            )
          )}

          <span className="user-greeting">
            {isUserAdmin ? (
              <i className="bi bi-shield-fill-check text-accent me-1"></i>
            ) : (
              <i className="bi bi-person-circle me-1 text-accent"></i>
            )}
            <span>{userName}</span>
          </span>

          <button onClick={handleLogout} className="btn-logout" type="button" title="Sair" aria-label="Sair">
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </nav>
  );
};
