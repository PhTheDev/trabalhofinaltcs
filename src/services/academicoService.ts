import { db, counters, saveDb } from './dbService';
import type { ICategoria, ICurso, ITrilha, ITrilhaCurso } from '../types';

export class AcademicoService {
  salvarCategoria(nome: string, descricao: string): ICategoria {
    if (db.categorias.some((c: ICategoria) => c.nome.toLowerCase() === nome.toLowerCase())) {
      throw new Error('Categoria já existe.');
    }
    const cat: ICategoria = {
      id: counters.categoria++,
      nome,
      descricao
    };
    db.categorias.push(cat);
    saveDb();
    return cat;
  }

  salvarCurso(cursoData: Omit<ICurso, 'id'>): ICurso {
    const curso: ICurso = {
      id: counters.curso++,
      ...cursoData
    };
    db.cursos.push(curso);
    saveDb();
    return curso;
  }

  listarCursosPorCategoria(categoriaId: number | string): ICurso[] {
    return db.cursos.filter((c: ICurso) => String(c.idCategoria) === String(categoriaId));
  }

  salvarTrilha(titulo: string, descricao: string, idCategoria: number): ITrilha {
    const trilha: ITrilha = {
      id: counters.trilha++,
      titulo,
      descricao,
      idCategoria
    };
    db.trilhas.push(trilha);
    saveDb();
    return trilha;
  }

  associarCursoTrilha(idTrilha: number, idCurso: number, ordem: number): ITrilhaCurso {
    const assoc: ITrilhaCurso = { idTrilha, idCurso, ordem };
    db.trilhasCursos.push(assoc);
    saveDb();
    return assoc;
  }

  listarTrilhaCursos(): ITrilhaCurso[] {
    return [...db.trilhasCursos].sort((a: ITrilhaCurso, b: ITrilhaCurso) => a.ordem - b.ordem);
  }
}
