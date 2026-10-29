/**
 * Responsabilidade: Mapear exclusivamente os métodos HTTP e caminhos das rotas
 * de pedidos para as funções correspondentes do controller.
 */

const express = require('express');
const pedidosController = require('../controllers/pedidos.controller');

const router = express.Router();

// RF01 - Criação de pedido
router.post('/', pedidosController.criar);

// RF02 - Listagem de pedidos
router.get('/', pedidosController.listar);

// RF03 - Consulta de pedido por ID
router.get('/:id', pedidosController.buscarPorId);

module.exports = router;
