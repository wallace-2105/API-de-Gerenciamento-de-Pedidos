/**
 * Responsabilidade: Isolar o acesso e a manipulação dos dados de pedidos em memória
 * (array de pedidos e controle de ID sequencial).
 * Justificativa: Permite substituir o armazenamento em memória por um banco de dados
 * no futuro sem precisar alterar o service ou o controller.
 */

// Armazenamento em memória (inicia vazio, sem seed automático)
let pedidos = [];
let proximoId = 1;

/**
 * Insere um novo pedido na lista em memória atribuindo um ID sequencial.
 * @param {Object} dadosPedido - Dados já validados pelo service.
 * @returns {Object} Pedido criado com ID gerado.
 */
function criar({ cliente, tipo, valor, prioridade, status }) {
  const novoPedido = {
    id: proximoId++,
    cliente,
    tipo,
    valor,
    prioridade,
    status
  };

  pedidos.push(novoPedido);
  return { ...novoPedido };
}

/**
 * Retorna a lista completa de pedidos cadastrados.
 * @returns {Array<Object>} Cópia da lista de pedidos.
 */
function listarTodos() {
  return pedidos.map((pedido) => ({ ...pedido }));
}

/**
 * Busca um pedido pelo seu ID numérico.
 * @param {number} id - ID numérico do pedido.
 * @returns {Object|null} Pedido encontrado ou null se não existir.
 */
function buscarPorId(id) {
  const pedido = pedidos.find((item) => item.id === id);
  return pedido ? { ...pedido } : null;
}

/**
 * Atualiza o status de um pedido existente pelo ID.
 * @param {number} id - ID numérico do pedido.
 * @param {string} novoStatus - Novo status já validado pelo service.
 * @returns {Object|null} Pedido atualizado ou null se não encontrado.
 */
function atualizarStatus(id, novoStatus) {
  const pedido = pedidos.find((item) => item.id === id);
  if (!pedido) {
    return null;
  }

  pedido.status = novoStatus;
  return { ...pedido };
}

/**
 * Limpa todos os pedidos em memória e reinicia o contador de ID para 1.
 * Utilizado nos testes automatizados (beforeEach) para garantir isolamento entre testes.
 */
function limpar() {
  pedidos = [];
  proximoId = 1;
}

module.exports = {
  criar,
  listarTodos,
  buscarPorId,
  atualizarStatus,
  limpar
};
