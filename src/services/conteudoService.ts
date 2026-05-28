import { db, counters, saveDb } from './dbService';
import type { IModulo, IAula, ICurso } from '../types';

export class ConteudoService {
  salvarModulo(idCurso: number, titulo: string, ordem: number): IModulo {
    const modulo: IModulo = {
      id: counters.modulo++,
      idCurso,
      titulo,
      ordem
    };
    db.modulos.push(modulo);
    saveDb();
    return modulo;
  }

  salvarAula(
    idModulo: number,
    titulo: string,
    tipoConteudo: 'Vídeo' | 'Texto' | 'Quiz',
    urlConteudo: string,
    duracaoMinutos: number,
    ordem: number
  ): IAula {
    const aula: IAula = {
      id: counters.aula++,
      idModulo,
      titulo,
      tipoConteudo,
      urlConteudo,
      duracaoMinutos,
      ordem
    };
    db.aulas.push(aula);
    saveDb();
    return aula;
  }

  listarConteudo() {
    return [...db.modulos]
      .sort((a: IModulo, b: IModulo) => a.ordem - b.ordem)
      .map((modulo: IModulo) => ({
        modulo,
        curso: db.cursos.find((c: ICurso) => String(c.id) === String(modulo.idCurso)),
        aulas: db.aulas
          .filter((a: IAula) => String(a.idModulo) === String(modulo.id))
          .sort((a: IAula, b: IAula) => a.ordem - b.ordem)
      }));
  }
}
