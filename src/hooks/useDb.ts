import { useState, useEffect } from 'react';
import type { IUsuario, ICategoria, ICurso, IModulo, IAula, IMatricula, IProgressoAula, ITrilha, ITrilhaCurso, ICertificado, IPlano, IAssinatura, IPagamento } from '../types';

import { API_URL } from '../config';

export interface IDbState {
  usuarios: IUsuario[];
  categorias: ICategoria[];
  cursos: ICurso[];
  modulos: IModulo[];
  aulas: IAula[];
  matriculas: IMatricula[];
  progressoAulas: IProgressoAula[];
  trilhas: ITrilha[];
  trilhasCursos: ITrilhaCurso[];
  certificados: ICertificado[];
  planos: IPlano[];
  assinaturas: IAssinatura[];
  pagamentos: IPagamento[];
}

const initialState: IDbState = {
  usuarios: [], categorias: [], cursos: [], modulos: [], aulas: [],
  matriculas: [], progressoAulas: [], trilhas: [], trilhasCursos: [],
  certificados: [], planos: [], assinaturas: [], pagamentos: []
};

export function useDb(refreshTrigger: number = 0) {
  const [dbState, setDbState] = useState<IDbState>(initialState);

  useEffect(() => {
    const fetchData = async () => {
      const endpoints = [
        'usuarios', 'categorias', 'cursos', 'modulos', 'aulas', 
        'matriculas', 'progressoAulas', 'trilhas', 'trilhasCursos', 
        'certificados', 'planos', 'assinaturas', 'pagamentos'
      ];
      
      try {
        const responses = await Promise.all(endpoints.map(e => fetch(`${API_URL}/${e}`)));
        const data = await Promise.all(responses.map(res => res.json()));
        
        const newState: any = {};
        endpoints.forEach((e, idx) => {
          newState[e] = data[idx];
        });
        
        setDbState(newState as IDbState);
      } catch (e) {
        console.error("Erro ao buscar dados do JSON Server", e);
      }
    };
    
    fetchData();
  }, [refreshTrigger]);

  return dbState;
}
