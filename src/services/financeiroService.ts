import { db, counters, nowIso, byId, saveDb } from './dbService';
import type { IPlano, IAssinatura, IPagamento } from '../types';

export class FinanceiroService {
  salvarPlano(nome: string, descricao: string, preco: number, duracaoMeses: number): IPlano {
    const plano: IPlano = {
      id: counters.plano++,
      nome,
      descricao,
      preco,
      duracaoMeses
    };
    db.planos.push(plano);
    saveDb();
    return plano;
  }

  checkout(idUsuario: number, idPlano: number, metodoPagamento: 'PIX' | 'Cartão' | 'Boleto') {
    const plano = byId(db.planos, idPlano);
    if (!plano) throw new Error('Plano inválido.');

    const inicio = new Date();
    const fim = new Date(inicio);
    fim.setMonth(fim.getMonth() + plano.duracaoMeses);

    const assinatura: IAssinatura = {
      id: counters.assinatura++,
      idUsuario,
      idPlano,
      dataInicio: inicio.toISOString(),
      dataFim: fim.toISOString()
    };
    db.assinaturas.push(assinatura);

    const pagamento: IPagamento = {
      id: counters.pagamento++,
      idAssinatura: assinatura.id,
      valorPago: plano.preco,
      dataPagamento: nowIso(),
      metodoPagamento,
      idTransacaoGateway: `TXN-${Date.now().toString(36).toUpperCase()}`
    };
    db.pagamentos.push(pagamento);

    saveDb();
    return { assinatura, pagamento };
  }
}
export const financeiroService = new FinanceiroService();
