import type { ICategoria, ICurso, ITrilha, ITrilhaCurso } from '../types';
import { apiList, apiRequest } from '../lib/api';
import { mapCategoria, mapCurso, mapTrilhaCurso, toCursoPayload } from '../lib/mappers';

export class AcademicoService {
  async salvarCategoria(nome: string, descricao: string): Promise<ICategoria> {
    const categorias = (await apiList('/categorias')).map(mapCategoria);
    if (categorias.some((item) => item.nome.toLowerCase() === nome.toLowerCase())) {
      throw new Error('Categoria já existe.');
    }
    return apiRequest('/categorias', {
      method: 'POST',
      body: JSON.stringify({ nome, descricao }),
    });
  }

  async salvarCurso(cursoData: Omit<ICurso, 'id'>): Promise<ICurso> {
    const raw = await apiRequest('/cursos', {
      method: 'POST',
      body: JSON.stringify(toCursoPayload(cursoData)),
    });
    return mapCurso(raw);
  }

  async listarCursosPorCategoria(categoriaId: number | string): Promise<ICurso[]> {
    const cursos = (await apiList('/cursos')).map(mapCurso);
    return cursos.filter((curso) => String(curso.idCategoria) === String(categoriaId));
  }

  async listarCursos(): Promise<ICurso[]> {
    return (await apiList('/cursos')).map(mapCurso);
  }

  async listarCategorias(): Promise<ICategoria[]> {
    return (await apiList('/categorias')).map(mapCategoria);
  }

  async salvarTrilha(titulo: string, descricao: string, idCategoria: number): Promise<ITrilha> {
    return apiRequest('/trilhas', {
      method: 'POST',
      body: JSON.stringify({ titulo, descricao, idCategoria }),
    });
  }

  async associarCursoTrilha(idTrilha: number, idCurso: number, ordem: number): Promise<ITrilhaCurso> {
    const raw = await apiRequest('/trilha-curso', {
      method: 'POST',
      body: JSON.stringify({ idTrilha, idCurso, ordem: String(ordem) }),
    });
    return mapTrilhaCurso(raw);
  }

  async listarTrilhaCursos(): Promise<ITrilhaCurso[]> {
    return (await apiList('/trilha-curso'))
      .map(mapTrilhaCurso)
      .sort((a, b) => a.ordem - b.ordem);
  }
}
