import type { IPlano, IAssinatura, IPagamento } from '../types';
import { apiList, apiRequest } from '../lib/api';
import { mapAssinatura, mapPagamento, mapPlano, toMetodoPagamento } from '../lib/mappers';

export class FinanceiroService {
  async salvarPlano(nome: string, descricao: string, preco: number, duracaoMeses: number): Promise<IPlano> {
    const raw = await apiRequest('/planos', {
      method: 'POST',
      body: JSON.stringify({ nome, descricao, preco, duracaoMeses }),
    });
    return mapPlano(raw);
  }

  async listarPlanos(): Promise<IPlano[]> {
    return (await apiList('/planos')).map(mapPlano);
  }

  async checkout(idUsuario: number, idPlano: number, metodoPagamento: 'PIX' | 'Cartão' | 'Boleto'): Promise<{ assinatura: IAssinatura, pagamento: IPagamento }> {
    const plano = mapPlano(await apiRequest(`/planos/${idPlano}`));

    const inicio = new Date();
    const fim = new Date(inicio);
    fim.setMonth(fim.getMonth() + plano.duracaoMeses);

    const assinatura = mapAssinatura(await apiRequest('/assinaturas', {
      method: 'POST',
      body: JSON.stringify({
        idUsuario,
        idPlano,
        dataInicio: inicio.toISOString(),
        dataFim: fim.toISOString(),
      }),
    }));

    const pagamento = mapPagamento(await apiRequest('/pagamentos', {
      method: 'POST',
      body: JSON.stringify({
        idAssinatura: assinatura.id,
        valorPago: plano.preco,
        dataPagamento: new Date().toISOString(),
        metodoPagamento: toMetodoPagamento(metodoPagamento),
        idTransacaoGateway: Date.now(),
      }),
    }));

    return { assinatura, pagamento };
  }
}
export const financeiroService = new FinanceiroService();
