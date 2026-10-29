/**
 * Responsabilidade: Concentrar todas as regras de negócio da aplicação,
 * incluindo validação de dados de entrada, definição do status inicial ("recebido"),
 * verificação de existência de pedidos e controle de transições de status.
 */

const pedidosRepository = require('../repositories/pedidos.repository');
const { TIPOS, PRIORIDADES } = require('../constants/pedido.constants');
const { ValidationError, NotFoundError } = require('../errors/AppError');

/**
 * Converte e valida o parâmetro de ID para inteiro positivo.
 * Retorna null caso o ID seja inválido (ex.: "abc", "1.5", "-1", "0").
 * @param {string|number} idParam - ID recebido na rota ou chamada direta.
 * @returns {number|null} ID numérico válido ou null.
 */
function converterId(idParam) {
  if (typeof idParam === 'number' && Number.isInteger(idParam) && idParam > 0) {
    return idParam;
  }

  if (typeof idParam === 'string' && /^[1-9]\d*$/.test(idParam)) {
    return Number(idParam);
  }

  return null;
}

/**
 * Valida os dados e cria um novo pedido com status inicial "recebido".
 * Campos extras enviados no body (como id ou status) são ignorados.
 * @param {Object} dados - Corpo da requisição.
 * @returns {Object} Pedido criado.
 */
function criarPedido(dados) {
  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
    throw new ValidationError('Dados inválidos', [
      'O corpo da requisição deve ser um objeto JSON válido'
    ]);
  }

  const detalhes = [];

  // Validação do cliente: obrigatório, string e não vazio após trim()
  if (typeof dados.cliente !== 'string' || dados.cliente.trim().length === 0) {
    detalhes.push('cliente é obrigatório e não pode ser vazio');
  }

  // Validação do tipo: comparação estrita com a lista de tipos aceitos
  if (typeof dados.tipo !== 'string' || !TIPOS.includes(dados.tipo)) {
    detalhes.push(`tipo deve ser um dos valores permitidos: ${TIPOS.join(', ')}`);
  }

  // Validação do valor: deve ser typeof number, finito e maior que zero (rejeita strings numéricas)
  if (
    typeof dados.valor !== 'number' ||
    !Number.isFinite(dados.valor) ||
    dados.valor <= 0
  ) {
    detalhes.push('valor deve ser um número maior que zero');
  }

  // Validação da prioridade: comparação estrita com a lista de prioridades aceitas
  if (typeof dados.prioridade !== 'string' || !PRIORIDADES.includes(dados.prioridade)) {
    detalhes.push(
      `prioridade deve ser um dos valores permitidos: ${PRIORIDADES.join(', ')}`
    );
  }

  if (detalhes.length > 0) {
    throw new ValidationError('Dados inválidos', detalhes);
  }

  return pedidosRepository.criar({
    cliente: dados.cliente.trim(),
    tipo: dados.tipo,
    valor: dados.valor,
    prioridade: dados.prioridade,
    status: 'recebido'
  });
}

/**
 * Retorna todos os pedidos cadastrados.
 * @returns {Array<Object>} Lista de pedidos.
 */
function listarPedidos() {
  return pedidosRepository.listarTodos();
}

/**
 * Busca um pedido existente pelo ID.
 * IDs não numéricos (ex.: "abc", "1.5") ou inexistentes resultam em 404 (NotFoundError).
 * @param {string|number} idParam - ID do pedido.
 * @returns {Object} Pedido encontrado.
 */
function buscarPedidoPorId(idParam) {
  const id = converterId(idParam);
  if (id === null) {
    throw new NotFoundError('Pedido não encontrado');
  }

  const pedido = pedidosRepository.buscarPorId(id);
  if (!pedido) {
    throw new NotFoundError('Pedido não encontrado');
  }

  return pedido;
}

module.exports = {
  criarPedido,
  listarPedidos,
  buscarPedidoPorId
};
