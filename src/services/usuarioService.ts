import type { IUsuario, IMatricula, IProgressoAula, ICertificado } from '../types';
import { passwordHash } from './authService';

import { API_URL } from '../config';

export class UsuarioService {
  async salvar(nomeCompleto: string, email: string, senha: string): Promise<IUsuario> {
    const resVerifica = await fetch(`${API_URL}/usuarios?email=${encodeURIComponent(email)}`);
    const usuarios = await resVerifica.json();
    if (usuarios.length > 0) {
      throw new Error('E-mail já cadastrado.');
    }
    const res = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nomeCompleto,
        email,
        senhaHash: passwordHash(senha),
        dataCadastro: new Date().toISOString(),
        role: 'aluno'
      })
    });
    return res.json();
  }

  async matricular(idUsuario: number, idCurso: number): Promise<IMatricula> {
    const resVerifica = await fetch(`${API_URL}/matriculas?idUsuario=${idUsuario}&idCurso=${idCurso}`);
    const matriculas = await resVerifica.json();
    if (matriculas.length > 0) return matriculas[0];

    const res = await fetch(`${API_URL}/matriculas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idUsuario,
        idCurso,
        dataMatricula: new Date().toISOString()
      })
    });
    return res.json();
  }

  async listarMatriculas(idUsuario: number): Promise<IMatricula[]> {
    const res = await fetch(`${API_URL}/matriculas?idUsuario=${idUsuario}`);
    return res.json();
  }

  async atualizarProgresso(idUsuario: number, idAula: number, status: 'Concluído' | 'Em andamento'): Promise<IProgressoAula> {
    const resVerifica = await fetch(`${API_URL}/progressoAulas?idUsuario=${idUsuario}&idAula=${idAula}`);
    const progressos = await resVerifica.json();
    if (progressos.length > 0) {
      const existente = progressos[0];
      const res = await fetch(`${API_URL}/progressoAulas/${existente.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, dataConclusao: new Date().toISOString() })
      });
      return res.json();
    } else {
      const res = await fetch(`${API_URL}/progressoAulas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idUsuario,
          idAula,
          dataConclusao: new Date().toISOString(),
          status
        })
      });
      return res.json();
    }
  }

  async emitirCertificado(idUsuario: number, idCurso: number): Promise<ICertificado> {
    const resVerifica = await fetch(`${API_URL}/certificados?idUsuario=${idUsuario}&idCurso=${idCurso}`);
    const certificados = await resVerifica.json();
    if (certificados.length > 0) return certificados[0];

    const res = await fetch(`${API_URL}/certificados`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idUsuario,
        idCurso,
        codigoAutenticidade: `CERT-${Date.now().toString(36).toUpperCase()}`,
        dataEmissao: new Date().toISOString()
      })
    });
    return res.json();
  }
}

export const usuarioService = new UsuarioService();
