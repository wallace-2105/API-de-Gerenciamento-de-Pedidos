/**
 * Responsabilidade: Inicializar o servidor HTTP na porta configurada
 * (process.env.PORT ou 3000 por padrão).
 */

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
