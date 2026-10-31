/**
 * Responsabilidade: Testes de integração dos endpoints HTTP da API utilizando Supertest,
 * cobrindo criação, listagem, consulta por ID, atualização de status e tratamento de erros (400, 404, 500).
 */

const request = require('supertest');
const app = require('../src/app');
const pedidosRepository = require('../src/repositories/pedidos.repository');
const pedidosService = require('../src/services/pedidos.service');

describe('Testes de Integração - Rotas de Pedidos (/pedidos)', () => {
  beforeEach(() => {
    pedidosRepository.limpar();
    jest.restoreAllMocks();
  });

  describe('POST /pedidos', () => {
    test('deve criar um pedido válido com status 201, status inicial "recebido" e id 1', async () => {
      const resposta = await request(app)
        .post('/pedidos')
        .send({
          cliente: 'Carlos Silva',
          tipo: 'entrega',
          valor: 350,
          prioridade: 'normal'
        });

      expect(resposta.status).toBe(201);
      expect(resposta.body).toEqual({
        id: 1,
        cliente: 'Carlos Silva',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal',
        status: 'recebido'
      });
    });

    test('deve salvar o cliente aplicando trim() quando enviado com espaços nas extremidades', async () => {
      const resposta = await request(app)
        .post('/pedidos')
        .send({
          cliente: '  Wallace Coimbra  ',
          tipo: 'retirada',
          valor: 180,
          prioridade: 'alta'
        });

      expect(resposta.status).toBe(201);
      expect(resposta.body.cliente).toBe('Wallace Coimbra');
    });

    test('deve gerar IDs sequenciais (1, 2, 3, 4)', async () => {
      const r1 = await request(app).post('/pedidos').send({
        cliente: 'Wallace Coimbra',
        tipo: 'entrega',
        valor: 100,
        prioridade: 'normal'
      });
      const r2 = await request(app).post('/pedidos').send({
        cliente: 'Nicole Henrique',
        tipo: 'retirada',
        valor: 200,
        prioridade: 'alta'
      });
      const r3 = await request(app).post('/pedidos').send({
        cliente: 'Javier Jose Garcia',
        tipo: 'local',
        valor: 300,
        prioridade: 'baixa'
      });
      const r4 = await request(app).post('/pedidos').send({
        cliente: 'Mateus Sepulvida',
        tipo: 'entrega',
        valor: 400,
        prioridade: 'alta'
      });

      expect(r1.body.id).toBe(1);
      expect(r2.body.id).toBe(2);
      expect(r3.body.id).toBe(3);
      expect(r4.body.id).toBe(4);
    });

    test.each([
      ['cliente vazio', { cliente: '', tipo: 'entrega', valor: 100, prioridade: 'normal' }],
      ['cliente só com espaços', { cliente: '   ', tipo: 'entrega', valor: 100, prioridade: 'normal' }],
      ['cliente ausente', { tipo: 'entrega', valor: 100, prioridade: 'normal' }],
      ['valor 0', { cliente: 'Mateus Sepulvida', tipo: 'entrega', valor: 0, prioridade: 'normal' }],
      ['valor negativo', { cliente: 'Mateus Sepulvida', tipo: 'entrega', valor: -50, prioridade: 'normal' }],
      ['valor string', { cliente: 'Mateus Sepulvida', tipo: 'entrega', valor: '350', prioridade: 'normal' }],
      ['valor ausente', { cliente: 'Mateus Sepulvida', tipo: 'entrega', prioridade: 'normal' }],
      ['tipo inválido', { cliente: 'Nicole Henrique', tipo: 'drone', valor: 100, prioridade: 'normal' }],
      ['prioridade inválida', { cliente: 'Javier Jose Garcia', tipo: 'entrega', valor: 100, prioridade: 'urgente' }],
      ['body vazio', {}]
    ])('deve retornar 400 com detalhes quando enviado com %s', async (_, payload) => {
      const resposta = await request(app).post('/pedidos').send(payload);

      expect(resposta.status).toBe(400);
      expect(resposta.body.erro).toBe('Dados inválidos');
      expect(Array.isArray(resposta.body.detalhes)).toBe(true);
      expect(resposta.body.detalhes.length).toBeGreaterThan(0);
    });
  });

  describe('GET /pedidos', () => {
    test('deve retornar 200 e array vazio [] quando não houver pedidos', async () => {
      const resposta = await request(app).get('/pedidos');

      expect(resposta.status).toBe(200);
      expect(resposta.body).toEqual([]);
    });

    test('deve retornar 200 e a lista com os pedidos cadastrados dos integrantes', async () => {
      await request(app).post('/pedidos').send({
        cliente: 'Wallace Coimbra',
        tipo: 'entrega',
        valor: 250,
        prioridade: 'alta'
      });
      await request(app).post('/pedidos').send({
        cliente: 'Nicole Henrique',
        tipo: 'retirada',
        valor: 120,
        prioridade: 'normal'
      });
      await request(app).post('/pedidos').send({
        cliente: 'Javier Jose Garcia',
        tipo: 'local',
        valor: 85,
        prioridade: 'baixa'
      });
      await request(app).post('/pedidos').send({
        cliente: 'Mateus Sepulvida',
        tipo: 'entrega',
        valor: 310,
        prioridade: 'alta'
      });

      const resposta = await request(app).get('/pedidos');

      expect(resposta.status).toBe(200);
      expect(resposta.body).toHaveLength(4);
      expect(resposta.body.map((p) => p.cliente)).toEqual([
        'Wallace Coimbra',
        'Nicole Henrique',
        'Javier Jose Garcia',
        'Mateus Sepulvida'
      ]);
    });
  });

  describe('GET /pedidos/:id', () => {
    test('deve retornar 200 e o pedido correspondente quando o ID existir', async () => {
      const criado = await request(app).post('/pedidos').send({
        cliente: 'Mateus Sepulvida',
        tipo: 'entrega',
        valor: 420,
        prioridade: 'alta'
      });

      const resposta = await request(app).get(`/pedidos/${criado.body.id}`);

      expect(resposta.status).toBe(200);
      expect(resposta.body).toEqual(criado.body);
    });

    test('deve retornar 404 para ID numérico inexistente (999)', async () => {
      const resposta = await request(app).get('/pedidos/999');

      expect(resposta.status).toBe(404);
      expect(resposta.body).toEqual({ erro: 'Pedido não encontrado' });
    });

    test('deve retornar 404 para ID não numérico ("abc") ou decimal ("1.5")', async () => {
      const rAbc = await request(app).get('/pedidos/abc');
      expect(rAbc.status).toBe(404);
      expect(rAbc.body).toEqual({ erro: 'Pedido não encontrado' });

      const rDecimal = await request(app).get('/pedidos/1.5');
      expect(rDecimal.status).toBe(404);
      expect(rDecimal.body).toEqual({ erro: 'Pedido não encontrado' });
    });
  });

  describe('PATCH /pedidos/:id/status', () => {
    test('deve executar o fluxo feliz completo: recebido -> em_preparacao -> enviado -> entregue', async () => {
      const criado = await request(app).post('/pedidos').send({
        cliente: 'Wallace Coimbra',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal'
      });
      const id = criado.body.id;

      const r1 = await request(app)
        .patch(`/pedidos/${id}/status`)
        .send({ status: 'em_preparacao' });
      expect(r1.status).toBe(200);
      expect(r1.body.status).toBe('em_preparacao');

      const r2 = await request(app)
        .patch(`/pedidos/${id}/status`)
        .send({ status: 'enviado' });
      expect(r2.status).toBe(200);
      expect(r2.body.status).toBe('enviado');

      const r3 = await request(app)
        .patch(`/pedidos/${id}/status`)
        .send({ status: 'entregue' });
      expect(r3.status).toBe(200);
      expect(r3.body.status).toBe('entregue');
    });

    test('deve permitir cancelamento a partir de "recebido"', async () => {
      const criado = await request(app).post('/pedidos').send({
        cliente: 'Nicole Henrique',
        tipo: 'retirada',
        valor: 150,
        prioridade: 'normal'
      });

      const resposta = await request(app)
        .patch(`/pedidos/${criado.body.id}/status`)
        .send({ status: 'cancelado' });

      expect(resposta.status).toBe(200);
      expect(resposta.body.status).toBe('cancelado');
    });

    test('deve retornar 400 para transição inválida (recebido -> entregue)', async () => {
      const criado = await request(app).post('/pedidos').send({
        cliente: 'Javier Jose Garcia',
        tipo: 'entrega',
        valor: 210,
        prioridade: 'alta'
      });

      const resposta = await request(app)
        .patch(`/pedidos/${criado.body.id}/status`)
        .send({ status: 'entregue' });

      expect(resposta.status).toBe(400);
      expect(resposta.body.erro).toContain("Transição inválida: de 'recebido' para 'entregue'");
    });

    test('deve retornar 400 ao tentar sair de estado final (entregue -> cancelado)', async () => {
      const criado = await request(app).post('/pedidos').send({
        cliente: 'Mateus Sepulvida',
        tipo: 'local',
        valor: 95,
        prioridade: 'baixa'
      });
      const id = criado.body.id;

      await request(app).patch(`/pedidos/${id}/status`).send({ status: 'em_preparacao' });
      await request(app).patch(`/pedidos/${id}/status`).send({ status: 'enviado' });
      await request(app).patch(`/pedidos/${id}/status`).send({ status: 'entregue' });

      const resposta = await request(app)
        .patch(`/pedidos/${id}/status`)
        .send({ status: 'cancelado' });

      expect(resposta.status).toBe(400);
      expect(resposta.body.erro).toBe(
        "Transição inválida: de 'entregue' para 'cancelado'. Transições permitidas: nenhuma"
      );
    });

    test('deve retornar 400 para status fora da lista permitida ou body sem status', async () => {
      const criado = await request(app).post('/pedidos').send({
        cliente: 'Carlos Silva',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal'
      });
      const id = criado.body.id;

      const rInvalido = await request(app)
        .patch(`/pedidos/${id}/status`)
        .send({ status: 'extraviado' });
      expect(rInvalido.status).toBe(400);

      const rSemStatus = await request(app)
        .patch(`/pedidos/${id}/status`)
        .send({});
      expect(rSemStatus.status).toBe(400);
    });

    test('deve retornar 404 para ID inexistente com body válido', async () => {
      const resposta = await request(app)
        .patch('/pedidos/999/status')
        .send({ status: 'cancelado' });

      expect(resposta.status).toBe(404);
      expect(resposta.body).toEqual({ erro: 'Pedido não encontrado' });
    });

    test('deve retornar 404 para ID inexistente mesmo com body inválido (prova ordem de verificação)', async () => {
      const resposta = await request(app)
        .patch('/pedidos/999/status')
        .send({ status: 'status_inexistente' });

      expect(resposta.status).toBe(404);
      expect(resposta.body).toEqual({ erro: 'Pedido não encontrado' });
    });
  });

  describe('Tratamento Global de Erros e Rotas Auxiliares', () => {
    test('deve retornar 200 e {"status":"ok"} em GET / e GET /saude', async () => {
      const rRaiz = await request(app).get('/');
      expect(rRaiz.status).toBe(200);
      expect(rRaiz.body).toEqual({ status: 'ok' });

      const rSaude = await request(app).get('/saude');
      expect(rSaude.status).toBe(200);
      expect(rSaude.body).toEqual({ status: 'ok' });
    });

    test('deve retornar 400 com {"erro":"JSON inválido"} quando o JSON for malformado', async () => {
      const resposta = await request(app)
        .post('/pedidos')
        .set('Content-Type', 'application/json')
        .send('{"cliente": "Wallace Coimbra", "valor": }');

      expect(resposta.status).toBe(400);
      expect(resposta.body).toEqual({ erro: 'JSON inválido' });
    });

    test('deve retornar 404 em JSON para rota inexistente', async () => {
      const resposta = await request(app).get('/rota-que-nao-existe');

      expect(resposta.status).toBe(404);
      expect(resposta.body).toEqual({ erro: 'Rota não encontrada' });
    });

    test('deve retornar 500 sem vazar detalhes internos quando ocorrer um erro inesperado', async () => {
      jest.spyOn(pedidosService, 'listarPedidos').mockImplementationOnce(() => {
        throw new Error('falha crítica secreta interna');
      });

      const resposta = await request(app).get('/pedidos');

      expect(resposta.status).toBe(500);
      expect(resposta.body).toEqual({ erro: 'Erro interno do servidor' });
      expect(JSON.stringify(resposta.body)).not.toContain('falha crítica secreta interna');
    });
  });
});
