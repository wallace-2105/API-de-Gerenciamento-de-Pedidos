/**
 * Responsabilidade: Configurar a instância da aplicação Express (middlewares globais,
 * leitura de JSON, registro de rotas, tratamento de rota inexistente 404 e errorHandler)
 * e exportá-la sem subir a porta HTTP, permitindo o uso direto nos testes com Supertest.
 */

const express = require('express');
const pedidosRoutes = require('./routes/pedidos.routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middleware para interpretar corpo de requisição em JSON
app.use(express.json());

// Rotas auxiliares de verificação de saúde da API
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/saude', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Rotas do domínio de pedidos
app.use('/pedidos', pedidosRoutes);

// Middleware para rotas não encontradas (404)
app.use(notFound);

// Middleware centralizado de tratamento de erros (400, 404, 500)
app.use(errorHandler);

module.exports = app;
