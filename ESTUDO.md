# Guia Rápido de Estudo para Avaliação Individual (`ESTUDO.md`)

Este resumo foi preparado para ajudar **Wallace Coimbra, Nicole Henrique, Javier Jose Garcia e Mateus Sepulvida** na avaliação individual de interpretação de código, localização de responsabilidades, previsão de comportamento e pequenas manutenções.

---

## 1. O que cada camada faz (1 parágrafo por camada)

- **`src/server.js` e `src/app.js` (Inicialização e Configuração)**: O `app.js` cria a instância do Express, ativa o leitor de JSON (`express.json()`), conecta as rotas de `/pedidos` e registra os dois middlewares finais (`notFound` e `errorHandler`), exportando o `app` sem abrir porta de rede para que o Supertest possa testá-lo diretamente. Já o `server.js` apenas importa o `app` e chama `app.listen(PORT)` na porta `3000`.
- **`src/routes/pedidos.routes.js` (Camada de Rotas)**: Funciona exclusivamente como um "mapa de trânsito" HTTP. Ele recebe o método + URL (`POST /`, `GET /`, `GET /:id`, `PATCH /:id/status`) e aponta qual função do Controller deve ser executada, sem ler dados da requisição e sem aplicar regras de negócio.
- **`src/controllers/pedidos.controller.js` (Camada de Controller)**: É a ponte entre o protocolo HTTP e a lógica da aplicação. Ele lê os dados que chegaram do cliente (`req.body` e `req.params.id`), chama a função correspondente do `pedidos.service.js` e devolve a resposta com o código HTTP correto (`201` na criação, `200` nas consultas e atualizações). Se o Service lançar um erro, o bloco `catch` repassa o erro para `next(err)`. **Importante:** o Controller nunca acessa o `repository` diretamente.
- **`src/services/pedidos.service.js` (Camada de Service / Regras de Negócio)**: É o "cérebro" da API. Aqui ficam todas as validações de criação (cliente com `trim()`, valor numérico `> 0`, tipo e prioridade válidos), a definição obrigatória do status inicial `"recebido"`, a conversão/validação de ID e a verificação das transições de status no `PATCH`. Quando algo viola uma regra, o Service lança `ValidationError` (400) ou `NotFoundError` (404).
- **`src/repositories/pedidos.repository.js` (Camada de Repository / Dados)**: É o único arquivo que conhece o array `pedidos = []` e a variável `proximoId = 1`. Ele apenas executa operações diretas de leitura e escrita em memória (`criar`, `listarTodos`, `buscarPorId`, `atualizarStatus`, `limpar`), sem saber o que é HTTP e sem julgar regras de negócio.
- **`src/constants/pedido.constants.js` (Constantes do Domínio)**: Guarda as listas de valores permitidos (`TIPOS`, `PRIORIDADES`, `STATUS`) e o objeto `TRANSICOES` que define a máquina de estados dos pedidos.
- **`src/errors/AppError.js` e `src/middlewares/` (Erros e Middlewares)**: `AppError.js` define as classes de erro com `statusCode` (`ValidationError` = 400, `NotFoundError` = 404). O middleware `notFound.js` responde `404` para URLs que não existem, e o `errorHandler.js` captura qualquer erro lançado no sistema para formatar o JSON final (`400`, `404` ou `500` para erros inesperados).

---

## 2. Onde alterar o código em cenários práticos de prova

### Cenário A: "Adicionar um novo tipo de pedido (ex.: `drive_thru`) ou nova prioridade (ex.: `urgente`)"
- **Onde mudar**: Abra [`src/constants/pedido.constants.js`](src/constants/pedido.constants.js).
- **O que fazer**: Adicione a string na lista `TIPOS` (ex.: `const TIPOS = ['entrega', 'retirada', 'local', 'drive_thru'];`) ou na lista `PRIORIDADES`.
- **Por que só lá?**: Porque o `pedidos.service.js` já valida usando `TIPOS.includes(dados.tipo)` e monta a mensagem de erro dinamicamente com `TIPOS.join(', ')`.

### Cenário B: "Adicionar um novo status (ex.: `em_rota`) no ciclo de vida do pedido"
- **Onde mudar**: Abra [`src/constants/pedido.constants.js`](src/constants/pedido.constants.js).
- **O que fazer**:
  1. Inclua `'em_rota'` no array `STATUS`.
  2. No objeto `TRANSICOES`, ajuste de qual status ele pode vir e para quais status ele pode ir (ex.: `enviado: ['em_rota', 'cancelado']` e `em_rota: ['entregue', 'cancelado']`).

### Cenário C: "Mudar uma regra de transição (ex.: proibir cancelamento quando já estiver `enviado`)"
- **Onde mudar**: Abra [`src/constants/pedido.constants.js`](src/constants/pedido.constants.js).
- **O que fazer**: No objeto `TRANSICOES`, altere a linha `enviado: ['entregue', 'cancelado']` para `enviado: ['entregue']`.

### Cenário D: "Trocar o armazenamento em memória por um Banco de Dados (SQLite, PostgreSQL, MongoDB)"
- **Onde mudar**: Abra [`src/repositories/pedidos.repository.js`](src/repositories/pedidos.repository.js).
- **O que fazer**: Substitua a manipulação do array `pedidos` pelas queries do banco de dados mantendo os mesmos nomes de funções (`criar`, `listarTodos`, `buscarPorId`, `atualizarStatus`, `limpar`). Se as funções passarem a ser assíncronas (`async/await`), basta adicionar `async/await` nas chamadas do `service` e `controller`.

### Cenário E: "Mudar uma mensagem de erro de validação ou adicionar uma nova regra (ex.: valor máximo de 10.000)"
- **Onde mudar**: Abra [`src/services/pedidos.service.js`](src/services/pedidos.service.js).
- **O que fazer**: Na função `criarPedido(dados)` (ou `atualizarStatus`), altere o texto adicionado em `detalhes.push(...)` ou adicione um novo `if (dados.valor > 10000) { detalhes.push('valor não pode ultrapassar 10000'); }`.

### Cenário F: "Mudar o código de status HTTP de sucesso ou ler um novo parâmetro da URL/Query"
- **Onde mudar**: Abra [`src/controllers/pedidos.controller.js`](src/controllers/pedidos.controller.js).
- **O que fazer**: Altere `res.status(...)` ou leia `req.query` / `req.params` na função correspondente e repasse para o Service.
