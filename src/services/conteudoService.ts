import type { IModulo, IAula, ICurso } from '../types';
import { apiList, apiRequest } from '../lib/api';
import { mapAula, mapCurso, mapModulo } from '../lib/mappers';

export class ConteudoService {
  async salvarModulo(idCurso: number, titulo: string, ordem: number): Promise<IModulo> {
    const raw = await apiRequest('/modulos', {
      method: 'POST',
      body: JSON.stringify({ idCurso, titulo, ordem: String(ordem) }),
    });
    return mapModulo(raw);
  }

  async salvarAula(
    idModulo: number,
    titulo: string,
    tipoConteudo: 'Vídeo' | 'Texto' | 'Quiz',
    urlConteudo: string,
    duracaoMinutos: number,
    ordem: number
  ): Promise<IAula> {
    const raw = await apiRequest('/aulas', {
      method: 'POST',
      body: JSON.stringify({
        idModulo,
        titulo,
        tipoConteudo,
        urlConteudo,
        duracaoMinutos,
        ordem: String(ordem),
      }),
    });
    return mapAula(raw);
  }

  async listarModulos(): Promise<IModulo[]> {
    return (await apiList('/modulos'))
      .map(mapModulo)
      .sort((a, b) => a.ordem - b.ordem);
  }

  async listarAulas(idModulo?: number): Promise<IAula[]> {
    const aulas = (await apiList('/aulas'))
      .map(mapAula)
      .sort((a, b) => a.ordem - b.ordem);
    if (idModulo == null) return aulas;
    return aulas.filter((aula) => aula.idModulo === idModulo);
  }

  async listarConteudo() {
    const modulos = await this.listarModulos();
    const aulas = await this.listarAulas();
    const cursos = (await apiList('/cursos')).map(mapCurso);

    return modulos.map(modulo => ({
      modulo,
      curso: cursos.find((c: ICurso) => String(c.id) === String(modulo.idCurso)),
      aulas: aulas.filter((a: IAula) => String(a.idModulo) === String(modulo.id))
    }));
  }
}
