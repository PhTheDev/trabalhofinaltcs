import type { IUsuario, IMatricula, IProgressoAula, ICertificado } from '../types';
import { apiList, apiRequest } from '../lib/api';
import {
  mapCertificado,
  mapMatricula,
  mapProgresso,
  mapUsuario,
  toProgressoStatus,
} from '../lib/mappers';

export class UsuarioService {
  async salvar(nomeCompleto: string, email: string, senha: string): Promise<IUsuario> {
    const raw = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify({ nome: nomeCompleto, email, senha }),
    });
    return mapUsuario(raw);
  }

  async matricular(idUsuario: number, idCurso: number): Promise<IMatricula> {
    const matriculas = (await apiList('/matriculas')).map(mapMatricula);
    const existente = matriculas.find(
      (item) => item.idUsuario === idUsuario && item.idCurso === idCurso,
    );
    if (existente) return existente;

    const raw = await apiRequest('/matriculas', {
      method: 'POST',
      body: JSON.stringify({
        idUsuario,
        idCurso,
        dataMatricula: new Date().toISOString(),
      }),
    });
    return mapMatricula(raw);
  }

  async listarMatriculas(idUsuario: number): Promise<IMatricula[]> {
    const matriculas = (await apiList('/matriculas')).map(mapMatricula);
    return matriculas.filter((item) => item.idUsuario === idUsuario);
  }

  async atualizarProgresso(
    idUsuario: number,
    idAula: number,
    status: 'Concluído' | 'Em andamento',
  ): Promise<IProgressoAula> {
    const payload = {
      status: toProgressoStatus(status),
      dataConclusao: new Date().toISOString(),
    };

    try {
      const raw = await apiRequest(`/progresso-aula/${idUsuario}/${idAula}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      return mapProgresso(raw);
    } catch {
      const raw = await apiRequest('/progresso-aula', {
        method: 'POST',
        body: JSON.stringify({
          idUsuario,
          idAula,
          ...payload,
        }),
      });
      return mapProgresso(raw);
    }
  }

  async emitirCertificado(idUsuario: number, idCurso: number): Promise<ICertificado> {
    const certificados = (await apiList('/certificados')).map(mapCertificado);
    const existente = certificados.find(
      (item) => item.idUsuario === idUsuario && item.idCurso === idCurso,
    );
    if (existente) return existente;

    const raw = await apiRequest('/certificados', {
      method: 'POST',
      body: JSON.stringify({
        idUsuario,
        idCurso,
        codigoVerificacao: `CERT-${Date.now().toString(36).toUpperCase()}`,
      }),
    });
    return mapCertificado(raw);
  }
}

export const usuarioService = new UsuarioService();
