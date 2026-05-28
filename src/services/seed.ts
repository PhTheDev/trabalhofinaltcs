import { db, counters, passwordHash, nowIso, saveDb } from './dbService';

export function seedData() {
  if (db.usuarios.length > 0) return; // Evita re-seed

  // Usuários
  const adminId = counters.usuario++;
  db.usuarios.push({
    id: adminId,
    nomeCompleto: 'Admin',
    email: 'admin@plataforma.com',
    senhaHash: passwordHash('0202'),
    dataCadastro: nowIso(),
    role: 'admin'
  });

  const alunoId = counters.usuario++;
  db.usuarios.push({
    id: alunoId,
    nomeCompleto: 'Aluno',
    email: 'aluno@plataforma.com',
    senhaHash: passwordHash('0202'),
    dataCadastro: nowIso(),
    role: 'aluno'
  });

  // Categoria
  const catId = counters.categoria++;
  db.categorias.push({
    id: catId,
    nome: 'Programação',
    descricao: 'Cursos de desenvolvimento web'
  });

  // Curso 1 — pago
  const curso1Id = counters.curso++;
  db.cursos.push({
    id: curso1Id,
    titulo: 'JavaScript Essencial',
    descricao: 'Aprenda os fundamentos do JavaScript moderno para desenvolvimento web.',
    idInstrutor: adminId,
    idCategoria: catId,
    nivel: 'Iniciante',
    dataPublicacao: new Date().toISOString().slice(0, 10),
    totalHoras: 10,
    preco: 49.90
  });

  // Curso 2 — gratuito
  const curso2Id = counters.curso++;
  db.cursos.push({
    id: curso2Id,
    titulo: 'HTML & CSS para Iniciantes',
    descricao: 'Construa suas primeiras páginas web do zero com HTML5 e CSS3.',
    idInstrutor: adminId,
    idCategoria: catId,
    nivel: 'Iniciante',
    dataPublicacao: new Date().toISOString().slice(0, 10),
    totalHoras: 8,
    preco: 0
  });

  // Módulo + Aula do curso 1
  const mod1Id = counters.modulo++;
  db.modulos.push({
    id: mod1Id,
    idCurso: curso1Id,
    titulo: 'Introdução ao JavaScript',
    ordem: 1
  });

  db.aulas.push({
    id: counters.aula++,
    idModulo: mod1Id,
    titulo: 'Primeiros Passos com JS',
    tipoConteudo: 'Vídeo',
    urlConteudo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duracaoMinutos: 10,
    ordem: 1
  });

  // Módulo + Aula do curso 2
  const mod2Id = counters.modulo++;
  db.modulos.push({
    id: mod2Id,
    idCurso: curso2Id,
    titulo: 'Estrutura HTML',
    ordem: 1
  });

  db.aulas.push({
    id: counters.aula++,
    idModulo: mod2Id,
    titulo: 'Tags Essenciais do HTML',
    tipoConteudo: 'Vídeo',
    urlConteudo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duracaoMinutos: 12,
    ordem: 1
  });

  saveDb();
}
