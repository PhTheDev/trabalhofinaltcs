import { db, counters, passwordHash, nowIso, saveDb } from './dbService';
import type { IUsuario } from '../types';

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

export function login(email: string, senha: string): { ok: boolean; usuario?: IUsuario; message?: string } {
  const hash = passwordHash(senha);
  const usuario = db.usuarios.find(
    (u: IUsuario) => u.email.toLowerCase() === email.toLowerCase() && u.senhaHash === hash
  );
  if (!usuario) {
    return { ok: false, message: 'E-mail ou senha incorretos.' };
  }
  setSession(usuario);
  return { ok: true, usuario };
}

export function cadastrarAluno(nomeCompleto: string, email: string, senha: string): { ok: boolean; usuario?: IUsuario; message?: string } {
  if (db.usuarios.some((u: IUsuario) => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, message: 'E-mail já cadastrado.' };
  }
  const u: IUsuario = {
    id: counters.usuario++,
    nomeCompleto,
    email,
    senhaHash: passwordHash(senha),
    dataCadastro: nowIso(),
    role: 'aluno'
  };
  db.usuarios.push(u);
  saveDb();
  setSession(u);
  return { ok: true, usuario: u };
}
