/**
 * Responsabilidade: Testes unitários da camada de service (pedidos.service.js),
 * validando isoladamente as regras de negócio, validações de campos, geração de IDs,
 * busca por ID e máquina de estados das transições de status.
 */

const pedidosService = require('../src/services/pedidos.service');
const pedidosRepository = require('../src/repositories/pedidos.repository');
const { ValidationError, NotFoundError } = require('../src/errors/AppError');

describe('Testes Unitários - Pedidos Service', () => {
  beforeEach(() => {
    pedidosRepository.limpar();
  });

  describe('criarPedido()', () => {
    test('deve criar um pedido válido com status inicial "recebido" e ID 1', () => {
      const pedido = pedidosService.criarPedido({
        cliente: 'Wallace Coimbra',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal'
      });

      expect(pedido).toEqual({
        id: 1,
        cliente: 'Wallace Coimbra',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal',
        status: 'recebido'
      });
    });

    test('deve remover espaços nas extremidades do nome do cliente (trim) e ignorar campos extras', () => {
      const pedido = pedidosService.criarPedido({
        id: 999,
        cliente: '  Wallace Coimbra  ',
        tipo: 'retirada',
        valor: 120.5,
        prioridade: 'alta',
        status: 'entregue',
        campoExtra: 'ignorar'
      });

      expect(pedido.id).toBe(1);
      expect(pedido.cliente).toBe('Wallace Coimbra');
      expect(pedido.status).toBe('recebido');
      expect(pedido.campoExtra).toBeUndefined();
    });

    test('deve rejeitar body ausente, null, array ou tipo primitivo com ValidationError (400)', () => {
      expect(() => pedidosService.criarPedido()).toThrow(ValidationError);
      expect(() => pedidosService.criarPedido(null)).toThrow(ValidationError);
      expect(() => pedidosService.criarPedido([])).toThrow(ValidationError);
      expect(() => pedidosService.criarPedido('texto')).toThrow(ValidationError);
      expect(() => pedidosService.criarPedido(123)).toThrow(ValidationError);
    });

    test('deve acumular todos os erros em detalhes quando múltiplos campos forem inválidos', () => {
      expect.assertions(3);
      try {
        pedidosService.criarPedido({});
      } catch (err) {
        expect(err).toBeInstanceOf(ValidationError);
        expect(err.statusCode).toBe(400);
        expect(err.detalhes).toHaveLength(4);
      }
    });

    test('deve rejeitar valor como string numérica ("350"), NaN, Infinity, zero ou negativo', () => {
      const base = {
        cliente: 'Nicole Henrique',
        tipo: 'local',
        prioridade: 'baixa'
      };

      expect(() => pedidosService.criarPedido({ ...base, valor: '350' })).toThrow(ValidationError);
      expect(() => pedidosService.criarPedido({ ...base, valor: 0 })).toThrow(ValidationError);
      expect(() => pedidosService.criarPedido({ ...base, valor: -50 })).toThrow(ValidationError);
      expect(() => pedidosService.criarPedido({ ...base, valor: NaN })).toThrow(ValidationError);
      expect(() => pedidosService.criarPedido({ ...base, valor: Infinity })).toThrow(ValidationError);
    });

    test('deve rejeitar tipo ou prioridade em maiúsculas (comparação estrita)', () => {
      expect(() =>
        pedidosService.criarPedido({
          cliente: 'Javier Jose Garcia',
          tipo: 'ENTREGA',
          valor: 100,
          prioridade: 'normal'
        })
      ).toThrow(ValidationError);

      expect(() =>
        pedidosService.criarPedido({
          cliente: 'Mateus Sepulvida',
          tipo: 'entrega',
          valor: 100,
          prioridade: 'ALTA'
        })
      ).toThrow(ValidationError);
    });
  });

  describe('buscarPedidoPorId()', () => {
    test('deve retornar o pedido quando o ID existir', () => {
      const criado = pedidosService.criarPedido({
        cliente: 'Carlos Silva',
        tipo: 'entrega',
        valor: 200,
        prioridade: 'normal'
      });

      const encontrado = pedidosService.buscarPedidoPorId(String(criado.id));
      expect(encontrado).toEqual(criado);
    });

    test('deve lançar NotFoundError (404) para ID inexistente, não numérico ou decimal', () => {
      expect(() => pedidosService.buscarPedidoPorId(999)).toThrow(NotFoundError);
      expect(() => pedidosService.buscarPedidoPorId('abc')).toThrow(NotFoundError);
      expect(() => pedidosService.buscarPedidoPorId('1.5')).toThrow(NotFoundError);
      expect(() => pedidosService.buscarPedidoPorId('0')).toThrow(NotFoundError);
      expect(() => pedidosService.buscarPedidoPorId('-1')).toThrow(NotFoundError);
    });
  });

  describe('atualizarStatus()', () => {
    test('deve permitir o fluxo completo: recebido -> em_preparacao -> enviado -> entregue', () => {
      const pedido = pedidosService.criarPedido({
        cliente: 'Wallace Coimbra',
        tipo: 'entrega',
        valor: 300,
        prioridade: 'alta'
      });

      const emPreparacao = pedidosService.atualizarStatus(pedido.id, { status: 'em_preparacao' });
      expect(emPreparacao.status).toBe('em_preparacao');

      const enviado = pedidosService.atualizarStatus(pedido.id, { status: 'enviado' });
      expect(enviado.status).toBe('enviado');

      const entregue = pedidosService.atualizarStatus(pedido.id, { status: 'entregue' });
      expect(entregue.status).toBe('entregue');
    });

    test('deve permitir cancelamento a partir de recebido, em_preparacao e enviado', () => {
      const p1 = pedidosService.criarPedido({
        cliente: 'Nicole Henrique',
        tipo: 'retirada',
        valor: 80,
        prioridade: 'normal'
      });
      expect(pedidosService.atualizarStatus(p1.id, { status: 'cancelado' }).status).toBe('cancelado');

      const p2 = pedidosService.criarPedido({
        cliente: 'Javier Jose Garcia',
        tipo: 'local',
        valor: 95,
        prioridade: 'baixa'
      });
      pedidosService.atualizarStatus(p2.id, { status: 'em_preparacao' });
      expect(pedidosService.atualizarStatus(p2.id, { status: 'cancelado' }).status).toBe('cancelado');

      const p3 = pedidosService.criarPedido({
        cliente: 'Mateus Sepulvida',
        tipo: 'entrega',
        valor: 150,
        prioridade: 'alta'
      });
      pedidosService.atualizarStatus(p3.id, { status: 'em_preparacao' });
      pedidosService.atualizarStatus(p3.id, { status: 'enviado' });
      expect(pedidosService.atualizarStatus(p3.id, { status: 'cancelado' }).status).toBe('cancelado');
    });

    test('deve impedir saída de estados finais (entregue e cancelado) com mensagem explicativa', () => {
      const pedido = pedidosService.criarPedido({
        cliente: 'Carlos Silva',
        tipo: 'entrega',
        valor: 350,
        prioridade: 'normal'
      });

      pedidosService.atualizarStatus(pedido.id, { status: 'em_preparacao' });
      pedidosService.atualizarStatus(pedido.id, { status: 'enviado' });
      pedidosService.atualizarStatus(pedido.id, { status: 'entregue' });

      expect(() =>
        pedidosService.atualizarStatus(pedido.id, { status: 'cancelado' })
      ).toThrow("Transição inválida: de 'entregue' para 'cancelado'. Transições permitidas: nenhuma");
    });

    test('deve impedir transição para o mesmo status atual', () => {
      const pedido = pedidosService.criarPedido({
        cliente: 'Wallace Coimbra',
        tipo: 'retirada',
        valor: 110,
        prioridade: 'normal'
      });

      expect(() =>
        pedidosService.atualizarStatus(pedido.id, { status: 'recebido' })
      ).toThrow("Transição inválida: de 'recebido' para 'recebido'. Transições permitidas: em_preparacao, cancelado");
    });

    test('deve verificar existência do ID (404) ANTES de validar o body (400)', () => {
      expect(() => pedidosService.atualizarStatus(999, null)).toThrow(NotFoundError);
      expect(() => pedidosService.atualizarStatus('abc', { status: 'invalido' })).toThrow(NotFoundError);
    });
  });
});
