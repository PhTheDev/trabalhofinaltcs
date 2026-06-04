export interface IUsuario {
  id: number;
  nomeCompleto: string;
  email: string;
  senhaHash: string;
  dataCadastro: string;
  role: 'aluno' | 'admin';
}

export interface ICategoria {
  id: number;
  nome: string;
  descricao: string;
}

export interface ICurso {
  id: number;
  titulo: string;
  descricao: string;
  idInstrutor: number;
  idCategoria: number;
  nivel: 'Iniciante' | 'Intermediário' | 'Avançado';
  dataPublicacao: string;
  totalHoras: number;
  preco: number;
}

export interface IModulo {
  id: number;
  idCurso: number;
  titulo: string;
  ordem: number;
}

export interface IAula {
  id: number;
  idModulo: number;
  titulo: string;
  tipoConteudo: 'Vídeo' | 'Texto' | 'Quiz';
  urlConteudo: string;
  duracaoMinutos: number;
  ordem: number;
}

export interface IMatricula {
  id: number;
  idUsuario: number;
  idCurso: number;
  dataMatricula: string;
}

export interface IProgressoAula {
  idUsuario: number;
  idAula: number;
  dataConclusao: string;
  status: 'Concluído' | 'Em andamento';
}

export interface ITrilha {
  id: number;
  titulo: string;
  descricao: string;
  idCategoria: number;
}

export interface ITrilhaCurso {
  idTrilha: number;
  idCurso: number;
  ordem: number;
}

export interface ICertificado {
  id: number;
  idUsuario: number;
  idCurso: number;
  codigoAutenticidade: string;
  dataEmissao: string;
}

export interface IPlano {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  duracaoMeses: number;
}

export interface IAssinatura {
  id: number;
  idUsuario: number;
  idPlano: number;
  dataInicio: string;
  dataFim: string;
}

export interface IPagamento {
  id: number;
  idAssinatura: number | null; // null para compra avulsa de curso
  valorPago: number;
  dataPagamento: string;
  metodoPagamento: 'PIX' | 'Cartão' | 'Boleto';
  idTransacaoGateway: string;
}

export interface IAvaliacao {
  id: number;
  idUsuario: number;
  idCurso: number;
  nota: number; // 1 a 5
  comentario: string | null;
  dataAvaliacao: string;
}
