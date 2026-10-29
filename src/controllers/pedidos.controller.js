/**
 * Responsabilidade: Receber as requisições HTTP (req), extrair parâmetros/body,
 * chamar a camada de service e devolver a resposta HTTP (res) com o código de status adequado.
 * NUNCA contém regras de negócio e NUNCA acessa o repository diretamente.
 */

const pedidosService = require('../services/pedidos.service');

/**
 * POST /pedidos - Cadastra um novo pedido (RF01).
 */
function criar(req, res, next) {
  try {
    const novoPedido = pedidosService.criarPedido(req.body);
    return res.status(201).json(novoPedido);
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /pedidos - Lista todos os pedidos cadastrados (RF02).
 */
function listar(req, res, next) {
  try {
    const pedidos = pedidosService.listarPedidos();
    return res.status(200).json(pedidos);
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /pedidos/:id - Consulta um pedido específico pelo ID (RF03).
 */
function buscarPorId(req, res, next) {
  try {
    const pedido = pedidosService.buscarPedidoPorId(req.params.id);
    return res.status(200).json(pedido);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  criar,
  listar,
  buscarPorId
};
