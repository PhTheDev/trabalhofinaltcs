import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  isAdmin?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isAdmin }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer mt-5">
      <div className="container py-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-4 text-center text-md-start">
            <Link className="footer-brand" to={isAdmin ? "/admin" : "/aluno"}>
              <span className="brand-accent">&lt;/</span>PH<span className="brand-accent">&gt;</span>
            </Link>
          </div>
          <div className="col-12 col-md-4">
            <nav aria-label="Rodapé">
              <ul className="footer-nav">
                {isAdmin && <li><Link to="/admin">Painel Admin</Link></li>}
                <li><Link to="/aluno">Área Aluno</Link></li>
              </ul>
            </nav>
          </div>
          <div className="col-12 col-md-4">
            <div className="footer-social justify-content-center justify-content-md-end">
              <a href="https://github.com/PhTheDev" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <i className="bi bi-github"></i>
              </a>
              <a href="https://www.linkedin.com/in/pedro-henrique-faria-6b22932a7/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <i className="bi bi-linkedin"></i>
              </a>
              <a href="https://www.instagram.com/phfaria02/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-copy">
          <p className="mb-0">© {currentYear} Pedro Henrique. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
