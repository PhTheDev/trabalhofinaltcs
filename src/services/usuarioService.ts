import { db, counters, nowIso, passwordHash, saveDb } from './dbService';
import type { IUsuario, IMatricula, IProgressoAula, ICertificado } from '../types';

export class UsuarioService {
  salvar(nomeCompleto: string, email: string, senha: string): IUsuario {
    if (db.usuarios.some((u: IUsuario) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('E-mail já cadastrado.');
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
    return u;
  }

  matricular(idUsuario: number, idCurso: number): IMatricula {
    const existente = db.matriculas.find(
      (m: IMatricula) => String(m.idUsuario) === String(idUsuario) && String(m.idCurso) === String(idCurso)
    );
    if (existente) return existente;

    const m: IMatricula = {
      id: counters.matricula++,
      idUsuario,
      idCurso,
      dataMatricula: nowIso()
    };
    db.matriculas.push(m);
    saveDb();
    return m;
  }

  atualizarProgresso(idUsuario: number, idAula: number, status: 'Concluído' | 'Em andamento'): IProgressoAula {
    const existente = db.progressoAulas.find(
      (p: IProgressoAula) => String(p.idUsuario) === String(idUsuario) && String(p.idAula) === String(idAula)
    );
    if (existente) {
      existente.status = status;
      existente.dataConclusao = nowIso();
      saveDb();
      return existente;
    } else {
      const prog: IProgressoAula = {
        idUsuario,
        idAula,
        dataConclusao: nowIso(),
        status
      };
      db.progressoAulas.push(prog);
      saveDb();
      return prog;
    }
  }

  emitirCertificado(idUsuario: number, idCurso: number): ICertificado {
    const existente = db.certificados.find(
      (c: ICertificado) => String(c.idUsuario) === String(idUsuario) && String(c.idCurso) === String(idCurso)
    );
    if (existente) return existente;

    const cert: ICertificado = {
      id: counters.certificado++,
      idUsuario,
      idCurso,
      codigoAutenticidade: `CERT-${Date.now().toString(36).toUpperCase()}`,
      dataEmissao: nowIso()
    };
    db.certificados.push(cert);
    saveDb();
    return cert;
  }
}

export const usuarioService = new UsuarioService();
