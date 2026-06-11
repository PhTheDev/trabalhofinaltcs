import type { IModulo, IAula, ICurso } from '../types';

import { API_URL } from '../config';

export class ConteudoService {
  async salvarModulo(idCurso: number, titulo: string, ordem: number): Promise<IModulo> {
    const res = await fetch(`${API_URL}/modulos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idCurso, titulo, ordem })
    });
    return res.json();
  }

  async salvarAula(
    idModulo: number,
    titulo: string,
    tipoConteudo: 'Vídeo' | 'Texto' | 'Quiz',
    urlConteudo: string,
    duracaoMinutos: number,
    ordem: number
  ): Promise<IAula> {
    const res = await fetch(`${API_URL}/aulas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idModulo,
        titulo,
        tipoConteudo,
        urlConteudo,
        duracaoMinutos,
        ordem
      })
    });
    return res.json();
  }

  async listarModulos(): Promise<IModulo[]> {
    const res = await fetch(`${API_URL}/modulos?_sort=ordem`);
    return res.json();
  }

  async listarAulas(idModulo?: number): Promise<IAula[]> {
    const url = idModulo 
      ? `${API_URL}/aulas?idModulo=${idModulo}&_sort=ordem`
      : `${API_URL}/aulas?_sort=ordem`;
    const res = await fetch(url);
    return res.json();
  }

  async listarConteudo() {
    const modulos = await this.listarModulos();
    const aulas = await this.listarAulas();
    const cursosRes = await fetch(`${API_URL}/cursos`);
    const cursos: ICurso[] = await cursosRes.json();

    return modulos.map(modulo => ({
      modulo,
      curso: cursos.find((c: ICurso) => String(c.id) === String(modulo.idCurso)),
      aulas: aulas.filter((a: IAula) => String(a.idModulo) === String(modulo.id))
    }));
  }
}
