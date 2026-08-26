import { useState, useEffect } from 'react';
import type {
  IUsuario,
  ICategoria,
  ICurso,
  IModulo,
  IAula,
  IMatricula,
  IProgressoAula,
  ITrilha,
  ITrilhaCurso,
  ICertificado,
  IPlano,
  IAssinatura,
  IPagamento,
} from '../types';
import { apiList } from '../lib/api';
import {
  mapAssinatura,
  mapAula,
  mapCategoria,
  mapCertificado,
  mapCurso,
  mapMatricula,
  mapModulo,
  mapPagamento,
  mapPlano,
  mapProgresso,
  mapTrilha,
  mapTrilhaCurso,
  mapUsuario,
} from '../lib/mappers';

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

export type IDbResult = IDbState & {
  loading: boolean;
  error: string | null;
};

const initialState: IDbState = {
  usuarios: [], categorias: [], cursos: [], modulos: [], aulas: [],
  matriculas: [], progressoAulas: [], trilhas: [], trilhasCursos: [],
  certificados: [], planos: [], assinaturas: [], pagamentos: [],
};

export function useDb(refreshTrigger: number = 0): IDbResult {
  const [dbState, setDbState] = useState<IDbState>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          usuarios,
          categorias,
          cursos,
          modulos,
          aulas,
          matriculas,
          progressoAulas,
          trilhas,
          trilhasCursos,
          certificados,
          planos,
          assinaturas,
          pagamentos,
        ] = await Promise.all([
          apiList('/users', controller.signal).then((rows) => rows.map(mapUsuario)),
          apiList('/categorias', controller.signal).then((rows) => rows.map(mapCategoria)),
          apiList('/cursos', controller.signal).then((rows) => rows.map(mapCurso)),
          apiList('/modulos', controller.signal).then((rows) => rows.map(mapModulo)),
          apiList('/aulas', controller.signal).then((rows) => rows.map(mapAula)),
          apiList('/matriculas', controller.signal).then((rows) => rows.map(mapMatricula)),
          apiList('/progresso-aula', controller.signal).then((rows) => rows.map(mapProgresso)),
          apiList('/trilhas', controller.signal).then((rows) => rows.map(mapTrilha)),
          apiList('/trilha-curso', controller.signal).then((rows) => rows.map(mapTrilhaCurso)),
          apiList('/certificados', controller.signal).then((rows) => rows.map(mapCertificado)),
          apiList('/planos', controller.signal).then((rows) => rows.map(mapPlano)),
          apiList('/assinaturas', controller.signal).then((rows) => rows.map(mapAssinatura)),
          apiList('/pagamentos', controller.signal).then((rows) => rows.map(mapPagamento)),
        ]);

        if (controller.signal.aborted) return;

        setDbState({
          usuarios,
          categorias,
          cursos,
          modulos,
          aulas,
          matriculas,
          progressoAulas,
          trilhas,
          trilhasCursos,
          certificados,
          planos,
          assinaturas,
          pagamentos,
        });
      } catch (e) {
        if (controller.signal.aborted) return;
        const message = e instanceof Error ? e.message : 'Não foi possível carregar os dados.';
        const isAbort = e instanceof DOMException && e.name === 'AbortError';
        if (!isAbort) {
          setError(message === 'Failed to fetch'
            ? 'Não foi possível conectar ao backend. Confira se ele está na porta 8000.'
            : message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, [refreshTrigger]);

  return { ...dbState, loading, error };
}
