import type { IUsuario } from '../types';

const API_URL = 'http://localhost:3000';
const SESSION_KEY = 'ph_session';

export interface ISession {
  id: number;
  nomeCompleto: string;
  role: 'aluno' | 'admin';
}

export function passwordHash(v: string) {
  return btoa(unescape(encodeURIComponent(v)));
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
  const hash = passwordHash(senha);
  try {
    const res = await fetch(`${API_URL}/usuarios?email=${encodeURIComponent(email)}&senhaHash=${encodeURIComponent(hash)}`);
    const usuarios: IUsuario[] = await res.json();
    if (usuarios.length === 0) {
      return { ok: false, message: 'E-mail ou senha incorretos.' };
    }
    const usuario = usuarios[0];
    setSession(usuario);
    return { ok: true, usuario };
  } catch (e) {
    return { ok: false, message: 'Erro ao conectar com o servidor.' };
  }
}

export async function cadastrarAluno(nomeCompleto: string, email: string, senha: string): Promise<{ ok: boolean; usuario?: IUsuario; message?: string }> {
  try {
    const resVerifica = await fetch(`${API_URL}/usuarios?email=${encodeURIComponent(email)}`);
    const usuarios = await resVerifica.json();
    if (usuarios.length > 0) {
      return { ok: false, message: 'E-mail já cadastrado.' };
    }
    
    const u = {
      nomeCompleto,
      email,
      senhaHash: passwordHash(senha),
      dataCadastro: new Date().toISOString(),
      role: 'aluno'
    };
    
    const res = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(u)
    });
    
    const novoUsuario: IUsuario = await res.json();
    setSession(novoUsuario);
    return { ok: true, usuario: novoUsuario };
  } catch (e) {
    return { ok: false, message: 'Erro ao conectar com o servidor.' };
  }
}
