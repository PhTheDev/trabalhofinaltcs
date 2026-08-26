import type { IUsuario } from '../types';
import { apiRequest } from '../lib/api';
import { mapUsuario } from '../lib/mappers';

const SESSION_KEY = 'ph_session';

export interface ISession {
  id: number;
  nomeCompleto: string;
  role: 'aluno' | 'admin';
}

export function getSession(): ISession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(usuario: IUsuario) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    id: usuario.id,
    nomeCompleto: usuario.nomeCompleto,
    role: usuario.role
  }));
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export async function login(email: string, senha: string): Promise<{ ok: boolean; usuario?: IUsuario; message?: string }> {
  try {
    const raw = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    const usuario = mapUsuario(raw);
    setSession(usuario);
    return { ok: true, usuario };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : 'Erro ao conectar com o servidor.',
    };
  }
}

export async function cadastrarAluno(nomeCompleto: string, email: string, senha: string): Promise<{ ok: boolean; usuario?: IUsuario; message?: string }> {
  try {
    const raw = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify({
        nome: nomeCompleto,
        email,
        senha,
      }),
    });
    const usuario = mapUsuario(raw);
    setSession(usuario);
    return { ok: true, usuario };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : 'Erro ao conectar com o servidor.',
    };
  }
}
