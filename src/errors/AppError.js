/**
 * Responsabilidade: Definir as classes de erro customizadas da aplicação
 * (AppError, ValidationError e NotFoundError) para padronizar códigos HTTP e mensagens
 * lançadas pela camada de service e tratadas pelo middleware global de erros.
 */

class AppError extends Error {
  /**
   * @param {number} statusCode - Código de status HTTP (ex.: 400, 404).
   * @param {string} message - Mensagem principal do erro.
   * @param {Array<string>} [detalhes] - Lista opcional de detalhes de validação.
   */
  constructor(statusCode, message, detalhes = undefined) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    if (detalhes !== undefined) {
      this.detalhes = detalhes;
    }
  }
}

class ValidationError extends AppError {
  /**
   * Erro de validação de entrada ou regra de negócio (HTTP 400).
   * @param {string} [message='Dados inválidos'] - Mensagem explicativa do erro.
   * @param {Array<string>} [detalhes] - Lista opcional de erros por campo.
   */
  constructor(message = 'Dados inválidos', detalhes = undefined) {
    super(400, message, detalhes);
  }
}

class NotFoundError extends AppError {
  /**
   * Erro para recurso não encontrado (HTTP 404).
   * @param {string} [message='Pedido não encontrado'] - Mensagem de recurso inexistente.
   */
  constructor(message = 'Pedido não encontrado') {
    super(404, message);
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError
};
