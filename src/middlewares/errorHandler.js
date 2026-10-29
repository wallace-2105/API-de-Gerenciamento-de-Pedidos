/**
 * Responsabilidade: Tratamento centralizado de todos os erros da aplicação.
 * Converte ValidationError em HTTP 400, NotFoundError em HTTP 404,
 * JSON malformado (express.json) em HTTP 400 e erros inesperados em HTTP 500
 * sem vazar stack trace ou mensagens internas ao cliente.
 */

const { AppError } = require('../errors/AppError');

function errorHandler(err, req, res, next) {
  // Tratamento de JSON malformado enviado no corpo da requisição (gerado pelo express.json)
  if (
    err?.type === 'entity.parse.failed' ||
    (err instanceof SyntaxError && err.status === 400 && 'body' in err)
  ) {
    return res.status(400).json({
      erro: 'JSON inválido'
    });
  }

  // Tratamento de erros conhecidos da aplicação (ValidationError -> 400, NotFoundError -> 404)
  if (err instanceof AppError) {
    const corpoResposta = {
      erro: err.message
    };

    if (Array.isArray(err.detalhes) && err.detalhes.length > 0) {
      corpoResposta.detalhes = err.detalhes;
    }

    return res.status(err.statusCode).json(corpoResposta);
  }

  // Qualquer outro erro inesperado -> HTTP 500 (nunca vaza detalhes internos ou stack trace)
  if (process.env.NODE_ENV !== 'test') {
    console.error('[ERRO INTERNO]:', err);
  }

  return res.status(500).json({
    erro: 'Erro interno do servidor'
  });
}

module.exports = errorHandler;
