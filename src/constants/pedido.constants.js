/**
 * Responsabilidade: Centralizar as constantes do domínio de pedidos
 * (tipos aceitos, níveis de prioridade, status possíveis e matriz de transições de status).
 * Facilita a manutenção e evita valores mágicos espalhados pelo código.
 */

const TIPOS = ['entrega', 'retirada', 'local'];

const PRIORIDADES = ['baixa', 'normal', 'alta'];

const STATUS = ['recebido', 'em_preparacao', 'enviado', 'entregue', 'cancelado'];

// Mapa de transições permitidas a partir de cada status atual
const TRANSICOES = {
  recebido: ['em_preparacao', 'cancelado'],
  em_preparacao: ['enviado', 'cancelado'],
  enviado: ['entregue', 'cancelado'],
  entregue: [],
  cancelado: []
};

module.exports = {
  TIPOS,
  PRIORIDADES,
  STATUS,
  TRANSICOES
};
