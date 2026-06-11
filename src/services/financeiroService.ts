import type { IPlano, IAssinatura, IPagamento } from '../types';

import { API_URL } from '../config';

export class FinanceiroService {
  async salvarPlano(nome: string, descricao: string, preco: number, duracaoMeses: number): Promise<IPlano> {
    const res = await fetch(`${API_URL}/planos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, descricao, preco, duracaoMeses })
    });
    return res.json();
  }

  async listarPlanos(): Promise<IPlano[]> {
    const res = await fetch(`${API_URL}/planos`);
    return res.json();
  }

  async checkout(idUsuario: number, idPlano: number, metodoPagamento: 'PIX' | 'Cartão' | 'Boleto'): Promise<{ assinatura: IAssinatura, pagamento: IPagamento }> {
    const resPlano = await fetch(`${API_URL}/planos/${idPlano}`);
    if (!resPlano.ok) throw new Error('Plano inválido.');
    const plano: IPlano = await resPlano.json();

    const inicio = new Date();
    const fim = new Date(inicio);
    fim.setMonth(fim.getMonth() + plano.duracaoMeses);

    // Save Assinatura
    const resAssinatura = await fetch(`${API_URL}/assinaturas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idUsuario,
        idPlano,
        dataInicio: inicio.toISOString(),
        dataFim: fim.toISOString()
      })
    });
    const assinatura: IAssinatura = await resAssinatura.json();

    // Save Pagamento
    const resPagamento = await fetch(`${API_URL}/pagamentos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idAssinatura: assinatura.id,
        valorPago: plano.preco,
        dataPagamento: new Date().toISOString(),
        metodoPagamento,
        idTransacaoGateway: `TXN-${Date.now().toString(36).toUpperCase()}`
      })
    });
    const pagamento: IPagamento = await resPagamento.json();

    return { assinatura, pagamento };
  }
}
export const financeiroService = new FinanceiroService();
