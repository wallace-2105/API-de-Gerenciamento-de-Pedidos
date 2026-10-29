/**
 * Responsabilidade: Interceptar requisições para rotas inexistentes e devolver
 * uma resposta padronizada em JSON com código HTTP 404.
 */

function notFound(req, res) {
  return res.status(404).json({
    erro: 'Rota não encontrada'
  });
}

module.exports = notFound;
