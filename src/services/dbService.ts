import type { IDbState, ICounters } from '../types';

const LS_DB = 'ph_db_v3';
const LS_CTR = 'ph_counters_v3';

// Banco de dados em memória inicial (vazio)
export const db: IDbState = {
  usuarios: [],
  categorias: [],
  cursos: [],
  modulos: [],
  aulas: [],
  matriculas: [],
  progressoAulas: [],
  trilhas: [],
  trilhasCursos: [],
  certificados: [],
  planos: [],
  assinaturas: [],
  pagamentos: []
};

// Contadores iniciais
export const counters: ICounters = {
  usuario: 1,
  categoria: 1,
  curso: 1,
  modulo: 1,
  aula: 1,
  matricula: 1,
  trilha: 1,
  certificado: 1,
  plano: 1,
  assinatura: 1,
  pagamento: 1
};

// Listeners para reatividade no React
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  listeners.forEach(listener => listener());
}

// Salvar no LocalStorage e notificar listeners
export function saveDb() {
  try {
    localStorage.setItem(LS_DB, JSON.stringify(db));
    localStorage.setItem(LS_CTR, JSON.stringify(counters));
    notify();
  } catch (e) {
    console.warn('[PhDB] Erro ao salvar:', e);
  }
}

// Limpar banco
export function clearDb() {
  localStorage.removeItem(LS_DB);
  localStorage.removeItem(LS_CTR);
  window.location.reload();
}

// Utilitários de Hash e datas (compatíveis com os originais)
export const byId = <T extends { id: number }>(arr: T[], id: number | string): T | undefined =>
  arr.find(i => String(i.id) === String(id));

export const nowIso = () => new Date().toISOString();

export const formatDate = (iso: string) => new Date(iso).toLocaleString('pt-BR');

export const passwordHash = (v: string) => btoa(unescape(encodeURIComponent(v)));

// Inicializar carregando do localStorage
export function initDb() {
  try {
    const rawDb = localStorage.getItem(LS_DB);
    const rawCtr = localStorage.getItem(LS_CTR);

    if (rawDb) {
      const saved = JSON.parse(rawDb);
      Object.keys(db).forEach(key => {
        const k = key as keyof IDbState;
        if (Array.isArray(saved[k])) {
          (db as any)[k] = saved[k];
        }
      });
    }

    if (rawCtr) {
      Object.assign(counters, JSON.parse(rawCtr));
    }
  } catch (e) {
    console.warn('[PhDB] Erro ao carregar:', e);
  }
}

// Inicializa imediatamente ao carregar o arquivo
initDb();
