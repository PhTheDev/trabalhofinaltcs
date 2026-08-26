import type {
  IAssinatura,
  IAula,
  ICategoria,
  ICertificado,
  ICurso,
  IMatricula,
  IModulo,
  IPagamento,
  IPlano,
  IProgressoAula,
  ITrilha,
  ITrilhaCurso,
  IUsuario,
} from '../types';

const ADMIN_EMAIL = 'admin@plataforma.com';

const NIVEL_TO_API = {
  Iniciante: 'INICIANTE',
  Intermediário: 'INTERMEDIARIO',
  Avançado: 'AVANCADO',
} as const;

const NIVEL_FROM_API = {
  INICIANTE: 'Iniciante',
  INTERMEDIARIO: 'Intermediário',
  AVANCADO: 'Avançado',
} as const;

const STATUS_TO_API = {
  Concluído: 'CONCLUIDA',
  'Em andamento': 'PENDENTE',
} as const;

const STATUS_FROM_API = {
  CONCLUIDA: 'Concluído',
  PENDENTE: 'Em andamento',
} as const;

const METODO_TO_API = {
  PIX: 'PIX',
  Cartão: 'CREDITO',
  Boleto: 'DEBITO',
} as const;

const METODO_FROM_API = {
  PIX: 'PIX',
  CREDITO: 'Cartão',
  DEBITO: 'Boleto',
} as const;

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toIso = (value: unknown) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return new Date(value as string).toISOString();
};

const asRecord = (value: unknown) => value as Record<string, unknown>;

export const mapUsuario = (user: unknown): IUsuario => {
  const row = asRecord(user);
  return {
    id: toNumber(row.id),
    nomeCompleto: String(row.nome ?? ''),
    email: String(row.email ?? ''),
    senhaHash: '',
    dataCadastro: toIso(row.createdAt),
    role: String(row.email ?? '').toLowerCase() === ADMIN_EMAIL ? 'admin' : 'aluno',
  };
};

export const mapCategoria = (categoria: unknown): ICategoria => {
  const row = asRecord(categoria);
  return {
    id: toNumber(row.id),
    nome: String(row.nome ?? ''),
    descricao: String(row.descricao ?? ''),
  };
};

export const mapCurso = (curso: unknown): ICurso => {
  const row = asRecord(curso);
  const nivel = String(row.nivel) as keyof typeof NIVEL_FROM_API;
  return {
    id: toNumber(row.id),
    titulo: String(row.titulo ?? ''),
    descricao: String(row.descricao ?? ''),
    idInstrutor: toNumber(row.idInstrutor),
    idCategoria: toNumber(row.idCategoria),
    nivel: NIVEL_FROM_API[nivel] ?? 'Iniciante',
    dataPublicacao: toIso(row.dataPublicacao),
    totalHoras: toNumber(row.totalHoras),
    preco: toNumber(row.preco),
  };
};

export const toCursoPayload = (curso: Omit<ICurso, 'id'>) => ({
  titulo: curso.titulo,
  descricao: curso.descricao,
  idInstrutor: curso.idInstrutor,
  idCategoria: curso.idCategoria,
  nivel: NIVEL_TO_API[curso.nivel],
  dataPublicacao: curso.dataPublicacao,
  totalHoras: curso.totalHoras,
  preco: curso.preco,
});

export const mapModulo = (modulo: unknown): IModulo => {
  const row = asRecord(modulo);
  return {
    id: toNumber(row.id),
    idCurso: toNumber(row.idCurso),
    titulo: String(row.titulo ?? ''),
    ordem: toNumber(row.ordem),
  };
};

export const mapAula = (aula: unknown): IAula => {
  const row = asRecord(aula);
  return {
    id: toNumber(row.id),
    idModulo: toNumber(row.idModulo),
    titulo: String(row.titulo ?? ''),
    tipoConteudo: (String(row.tipoConteudo) as IAula['tipoConteudo']) || 'Vídeo',
    urlConteudo: String(row.urlConteudo ?? ''),
    duracaoMinutos: toNumber(row.duracaoMinutos),
    ordem: toNumber(row.ordem),
  };
};

export const mapMatricula = (matricula: unknown): IMatricula => {
  const row = asRecord(matricula);
  return {
    id: toNumber(row.id),
    idUsuario: toNumber(row.idUsuario),
    idCurso: toNumber(row.idCurso),
    dataMatricula: toIso(row.dataMatricula),
  };
};

export const mapProgresso = (progresso: unknown): IProgressoAula => {
  const row = asRecord(progresso);
  const status = String(row.status) as keyof typeof STATUS_FROM_API;
  return {
    idUsuario: toNumber(row.idUsuario),
    idAula: toNumber(row.idAula),
    dataConclusao: toIso(row.dataConclusao),
    status: STATUS_FROM_API[status] ?? 'Em andamento',
  };
};

export const toProgressoStatus = (status: IProgressoAula['status']) =>
  STATUS_TO_API[status];

export const mapTrilha = (trilha: unknown): ITrilha => {
  const row = asRecord(trilha);
  return {
    id: toNumber(row.id),
    titulo: String(row.titulo ?? ''),
    descricao: String(row.descricao ?? ''),
    idCategoria: toNumber(row.idCategoria),
  };
};

export const mapTrilhaCurso = (item: unknown): ITrilhaCurso => {
  const row = asRecord(item);
  return {
    idTrilha: toNumber(row.idTrilha),
    idCurso: toNumber(row.idCurso),
    ordem: toNumber(row.ordem),
  };
};

export const mapCertificado = (certificado: unknown): ICertificado => {
  const row = asRecord(certificado);
  return {
    id: toNumber(row.id),
    idUsuario: toNumber(row.idUsuario),
    idCurso: toNumber(row.idCurso),
    codigoAutenticidade: String(row.codigoVerificacao ?? ''),
    dataEmissao: toIso(row.dataEmissao),
  };
};

export const mapPlano = (plano: unknown): IPlano => {
  const row = asRecord(plano);
  return {
    id: toNumber(row.id),
    nome: String(row.nome ?? ''),
    descricao: String(row.descricao ?? ''),
    preco: toNumber(row.preco),
    duracaoMeses: toNumber(row.duracaoMeses),
  };
};

export const mapAssinatura = (assinatura: unknown): IAssinatura => {
  const row = asRecord(assinatura);
  return {
    id: toNumber(row.id),
    idUsuario: toNumber(row.idUsuario),
    idPlano: toNumber(row.idPlano),
    dataInicio: toIso(row.dataInicio),
    dataFim: toIso(row.dataFim),
  };
};

export const mapPagamento = (pagamento: unknown): IPagamento => {
  const row = asRecord(pagamento);
  const metodo = String(row.metodoPagamento) as keyof typeof METODO_FROM_API;
  return {
    id: toNumber(row.id),
    idAssinatura: row.idAssinatura == null ? null : toNumber(row.idAssinatura),
    valorPago: toNumber(row.valorPago),
    dataPagamento: toIso(row.dataPagamento),
    metodoPagamento: METODO_FROM_API[metodo] ?? 'PIX',
    idTransacaoGateway: String(row.idTransacaoGateway ?? ''),
  };
};

export const toMetodoPagamento = (metodo: IPagamento['metodoPagamento']) =>
  METODO_TO_API[metodo];
