/**
 * Responsabilidade: Configurar a instância da aplicação Express (middlewares globais,
 * leitura de JSON e registro de rotas) e exportá-la sem subir a porta HTTP,
 * permitindo que os testes de integração utilizem o app diretamente com o Supertest.
 */

const express = require('express');
const pedidosRoutes = require('./routes/pedidos.routes');

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

module.exports = app;
