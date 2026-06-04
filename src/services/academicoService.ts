import type { ICategoria, ICurso, ITrilha, ITrilhaCurso } from '../types';

const API_URL = 'http://localhost:3000';

export class AcademicoService {
  async salvarCategoria(nome: string, descricao: string): Promise<ICategoria> {
    const resVerifica = await fetch(`${API_URL}/categorias?nome=${encodeURIComponent(nome)}`);
    const categorias = await resVerifica.json();
    if (categorias.length > 0) {
      throw new Error('Categoria já existe.');
    }
    const res = await fetch(`${API_URL}/categorias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, descricao })
    });
    return res.json();
  }

  async salvarCurso(cursoData: Omit<ICurso, 'id'>): Promise<ICurso> {
    const res = await fetch(`${API_URL}/cursos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cursoData)
    });
    return res.json();
  }

  async listarCursosPorCategoria(categoriaId: number | string): Promise<ICurso[]> {
    const res = await fetch(`${API_URL}/cursos?idCategoria=${categoriaId}`);
    return res.json();
  }

  async listarCursos(): Promise<ICurso[]> {
    const res = await fetch(`${API_URL}/cursos`);
    return res.json();
  }

  async listarCategorias(): Promise<ICategoria[]> {
    const res = await fetch(`${API_URL}/categorias`);
    return res.json();
  }

  async salvarTrilha(titulo: string, descricao: string, idCategoria: number): Promise<ITrilha> {
    const res = await fetch(`${API_URL}/trilhas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, descricao, idCategoria })
    });
    return res.json();
  }

  async associarCursoTrilha(idTrilha: number, idCurso: number, ordem: number): Promise<ITrilhaCurso> {
    const res = await fetch(`${API_URL}/trilhasCursos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idTrilha, idCurso, ordem })
    });
    return res.json();
  }

  async listarTrilhaCursos(): Promise<ITrilhaCurso[]> {
    const res = await fetch(`${API_URL}/trilhasCursos?_sort=ordem`);
    return res.json();
  }
}
