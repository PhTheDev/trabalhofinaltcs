import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getSession } from '../services/authService';
import { Login } from '../pages/Login';
import { AdminDashboard } from '../pages/AdminDashboard';
import { AlunoDashboard } from '../pages/AlunoDashboard';
import { Player } from '../pages/Player';

// Componente para proteção de rotas
interface ProtectedProps {
  children: React.ReactElement;
  allowedRole?: 'aluno' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedProps> = ({ children, allowedRole }) => {
  const session = getSession();

  if (!session) {
    // Redireciona para o login se não autenticado
    return <Navigate to="/" replace />;
  }

  if (allowedRole && session.role !== allowedRole) {
    // Admin pode acessar qualquer área; aluno só a de aluno.
    if (session.role === 'admin') {
      return children;
    }
    // Se for aluno tentando acessar admin
    return <Navigate to="/aluno" replace />;
  }

  return children;
};

export const AppRoutes: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Rota pública: Login/Cadastro */}
        <Route path="/" element={<Login />} />

        {/* Rotas protegidas */}
        <Route
          path="/aluno"
          element={
            <ProtectedRoute allowedRole="aluno">
              <AlunoDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/player/:cursoId"
          element={
            <ProtectedRoute allowedRole="aluno">
              <Player />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback de rotas desconhecidas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};
