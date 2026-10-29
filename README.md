# API de Gerenciamento de Pedidos

API RESTful desenvolvida em **Node.js** com **Express** para gerenciamento de pedidos de uma pequena loja, como projeto avaliativo da disciplina **Tópicos Avançados em Sistemas de Informação II**.

A aplicação permite cadastrar novos pedidos, listar todos os pedidos registrados, consultar um pedido específico por ID e controlar o ciclo de vida do pedido por meio de uma máquina de estados de status rigorosamente validada.

---

## 1. Integrantes

- **Wallace Coimbra** — `RA: <preencher>`
- **Nicole Henrique** — `RA: <preencher>`
- **Javier Jose Garcia** — `RA: <preencher>`
- **Mateus Sepulvida** — `RA: <preencher>`

---

## 2. Tecnologias Utilizadas

- **Node.js** (JavaScript CommonJS)
- **Express 4** (Framework web HTTP)
- **Jest** (Framework de testes unitários e de integração)
- **Supertest** (Testes HTTP de integração das rotas Express)
- **GitHub Actions** (Integração Contínua - CI executando `npm ci` e `npm test`)

---

## 3. Instalação e Execução

### Pré-requisitos
- Node.js (versão 18 ou superior; recomendado Node.js 20+)
- npm

### Passo a passo

```bash
# 1. Instalar as dependências do projeto
npm install

# 2. Iniciar o servidor em modo de produção (porta 3000 por padrão)
npm start

# 3. Iniciar o servidor em modo de desenvolvimento (com reinício automático)
npm run dev

# 4. Executar a suíte completa de testes automatizados (unitários + integração)
npm test
```

Por padrão, o servidor sobe em `http://localhost:3000` (ou na porta definida pela variável de ambiente `PORT`).

---

## 4. Arquitetura em Camadas

O projeto adota o padrão arquitetural em camadas **Routes -> Controller -> Service -> Repository**, garantindo separação clara de responsabilidades (SoC — *Separation of Concerns*), facilidade de leitura e testabilidade.

### Estrutura de Diretórios

```text
/
├── src/
│   ├── server.js                  # Inicializa o servidor HTTP (app.listen)
│   ├── app.js                     # Configura o Express (json, rotas, 404, errorHandler) e exporta o app
│   ├── routes/
│   │   └── pedidos.routes.js      # Mapeia método HTTP + caminho para o controller
│   ├── controllers/
│   │   └── pedidos.controller.js  # Lê req, aciona o service e devolve res com status HTTP
│   ├── services/
│   │   └── pedidos.service.js     # Regras de negócio, validações de campos e transições de status
│   ├── repositories/
│   │   └── pedidos.repository.js  # Acesso e manipulação dos dados em memória (array + contador de ID)
│   ├── errors/
│   │   └── AppError.js            # Classes de erro customizadas: AppError, ValidationError (400), NotFoundError (404)
│   ├── middlewares/
│   │   ├── notFound.js            # Tratamento de rotas inexistentes (404 JSON)
│   │   └── errorHandler.js        # Tratamento centralizado de erros (400, 404, 500)
│   └── constants/
│       └── pedido.constants.js    # Constantes do domínio: TIPOS, PRIORIDADES, STATUS e TRANSICOES
├── tests/
│   ├── pedidos.service.test.js    # Testes unitários das regras de negócio (Service)
│   └── pedidos.routes.test.js     # Testes de integração dos endpoints HTTP (Supertest)
├── evidencias/
│   └── README.md                  # Instruções passo a passo para captura dos prints no Postman
├── postman/
│   └── pedidos.postman_collection.json
├── .github/workflows/ci.yml       # Pipeline de CI no GitHub Actions
├── ESTUDO.md                      # Guia rápido de estudo e manutenção para os integrantes
├── .gitignore
├── package.json
└── README.md
```

### Responsabilidade de Cada Camada e Justificativas

1. **Routes (`src/routes/pedidos.routes.js`)**:
   - **Responsabilidade**: Apenas associar o verbo HTTP (`POST`, `GET`, `PATCH`) e o caminho da URL à função correspondente do Controller.
2. **Controllers (`src/controllers/pedidos.controller.js`)**:
   - **Responsabilidade**: Extrair dados da requisição HTTP (`req.body`, `req.params`), chamar o método adequado do Service e devolver a resposta HTTP (`res.status(...).json(...)`). Encaminha eventuais exceções para o middleware de erros via `next(err)`. **Nunca contém regras de negócio e nunca acessa o Repository diretamente.**
3. **Services (`src/services/pedidos.service.js`)**:
   - **Responsabilidade**: Concentrar 100% das regras de negócio: validação dos campos de criação, aplicação de `trim()` no nome do cliente, definição forçada do status inicial `"recebido"`, verificação de existência do pedido e validação das transições de status.
4. **Repositories (`src/repositories/pedidos.repository.js`)**:
   - **Responsabilidade**: Ler e gravar dados na estrutura em memória (`pedidos = []` e `proximoId = 1`).
   - **Justificativa da pasta**: Isolar o mecanismo de armazenamento. Caso no futuro a loja substitua o array em memória por um banco de dados relacional ou NoSQL (PostgreSQL, MongoDB, SQLite), apenas o `pedidos.repository.js` precisará ser alterado, mantendo `service` e `controller` intactos.
5. **Errors (`src/errors/AppError.js`)**:
   - **Justificativa da pasta**: Fornecer classes semânticas (`ValidationError` para HTTP 400 e `NotFoundError` para HTTP 404) que permitem ao Service sinalizar falhas de negócio sem acoplamento direto com objetos `req`/`res` do Express.
6. **Middlewares (`src/middlewares/notFound.js` e `errorHandler.js`)**:
   - **Justificativa da pasta**: Centralizar a formatação de respostas de erro e de rotas inexistentes em um único ponto da aplicação, evitando blocos `if/else` repetitivos nos controllers e garantindo que erros inesperados retornem HTTP 500 sem vazar detalhes internos.
7. **Constants (`src/constants/pedido.constants.js`)**:
   - **Justificativa da pasta**: Centralizar os valores permitidos do domínio (`TIPOS`, `PRIORIDADES`, `STATUS` e `TRANSICOES`), evitando strings mágicas duplicadas entre validações e testes.

---

## 5. Endpoints da API

| Método | Rota | Descrição | Sucesso | Erros Possíveis |
|---|---|---|---|---|
| `GET` | `/` ou `/saude` | Verificação de saúde da API | `200 OK` | — |
| `POST` | `/pedidos` | Cadastra um novo pedido | `201 Created` | `400 Bad Request` |
| `GET` | `/pedidos` | Lista todos os pedidos cadastrados | `200 OK` | — |
| `GET` | `/pedidos/:id` | Busca um pedido específico pelo ID | `200 OK` | `404 Not Found` |
| `PATCH` | `/pedidos/:id/status` | Atualiza o status de um pedido | `200 OK` | `400 Bad Request`, `404 Not Found` |

---

### 5.1. `POST /pedidos` — Criar Pedido

Cria um novo pedido. O `id` é gerado sequencialmente pelo servidor (iniciando em `1`) e o `status` inicial é sempre definido como `"recebido"`.

**Exemplo de Requisição (Sucesso):**
```http
POST /pedidos HTTP/1.1
Content-Type: application/json

{
  "cliente": "Nicole Henrique",
  "tipo": "entrega",
  "valor": 350,
  "prioridade": "alta"
}
```

**Resposta de Sucesso (`201 Created`):**
```json
{
  "id": 1,
  "cliente": "Nicole Henrique",
  "tipo": "entrega",
  "valor": 350,
  "prioridade": "alta",
  "status": "recebido"
}
```

**Exemplo de Requisição (Erro de Validação):**
```http
POST /pedidos HTTP/1.1
Content-Type: application/json

{
  "cliente": "",
  "tipo": "drone",
  "valor": -50,
  "prioridade": "urgente"
}
```

**Resposta de Erro (`400 Bad Request`):**
```json
{
  "erro": "Dados inválidos",
  "detalhes": [
    "cliente é obrigatório e não pode ser vazio",
    "tipo deve ser um dos valores permitidos: entrega, retirada, local",
    "valor deve ser um número maior que zero",
    "prioridade deve ser um dos valores permitidos: baixa, normal, alta"
  ]
}
```

---

### 5.2. `GET /pedidos` — Listar Pedidos

Retorna um array com todos os pedidos cadastrados. Caso nenhum pedido tenha sido criado, retorna `200 OK` com um array vazio `[]`.

**Resposta de Sucesso (`200 OK`):**
```json
[
  {
    "id": 1,
    "cliente": "Nicole Henrique",
    "tipo": "entrega",
    "valor": 350,
    "prioridade": "alta",
    "status": "recebido"
  },
  {
    "id": 2,
    "cliente": "Carlos Silva",
    "tipo": "retirada",
    "valor": 120,
    "prioridade": "normal",
    "status": "recebido"
  }
]
```

---

### 5.3. `GET /pedidos/:id` — Consultar Pedido por ID

Busca um pedido pelo seu identificador numérico.

**Resposta de Sucesso (`200 OK`):**
```json
{
  "id": 1,
  "cliente": "Nicole Henrique",
  "tipo": "entrega",
  "valor": 350,
  "prioridade": "alta",
  "status": "recebido"
}
```

**Resposta de Erro quando o ID não existe ou não é inteiro positivo (`404 Not Found`):**
```json
{
  "erro": "Pedido não encontrado"
}
```

---

### 5.4. `PATCH /pedidos/:id/status` — Atualizar Status do Pedido

Atualiza o status de um pedido respeitando as regras de transição da máquina de estados.

**Exemplo de Requisição (Sucesso):**
```http
PATCH /pedidos/1/status HTTP/1.1
Content-Type: application/json

{
  "status": "em_preparacao"
}
```

**Resposta de Sucesso (`200 OK`):**
```json
{
  "id": 1,
  "cliente": "Nicole Henrique",
  "tipo": "entrega",
  "valor": 350,
  "prioridade": "alta",
  "status": "em_preparacao"
}
```

**Resposta de Erro — Transição Inválida (`400 Bad Request`):**
```json
{
  "erro": "Transição inválida: de 'entregue' para 'cancelado'. Transições permitidas: nenhuma"
}
```

**Resposta de Erro — ID Inexistente (`404 Not Found`):**
```json
{
  "erro": "Pedido não encontrado"
}
```

---

## 6. Valores Aceitos e Regras de Validação

A comparação dos campos de domínio é **estrita** (case-sensitive, apenas letras minúsculas, sem normalização automática). Exemplo: `"ENTREGA"` ou `"Alta"` são rejeitados com erro `400`.

| Campo | Tipo Esperado | Valores Aceitos / Regra |
|---|---|---|
| `cliente` | `string` | Obrigatório. Não pode ser vazio após `trim()`. Salvo sem espaços nas extremidades. |
| `tipo` | `string` | `"entrega"`, `"retirada"`, `"local"` |
| `valor` | `number` | Obrigatório. Deve ser `typeof number`, finito e `> 0`. **Strings numéricas como `"350"` são rejeitadas.** |
| `prioridade` | `string` | `"baixa"`, `"normal"`, `"alta"` |
| `status` | `string` | `"recebido"`, `"em_preparacao"`, `"enviado"`, `"entregue"`, `"cancelado"` |

- Todos os erros de validação encontrados no corpo do `POST /pedidos` são acumulados e devolvidos juntos no array `detalhes`.

---

## 7. Máquina de Estados (Transições de Status) e Ordem de Verificação

### Diagrama e Tabela de Transições

```text
recebido      --> em_preparacao | cancelado
em_preparacao --> enviado       | cancelado
enviado       --> entregue      | cancelado
entregue      --> (estado final: nenhuma transição permitida)
cancelado     --> (estado final: nenhuma transição permitida)
```

| Status Atual | Próximos Status Permitidos | Pode Cancelar? | Estado Final? |
|---|---|---|---|
| `recebido` | `em_preparacao`, `cancelado` | Sim | Não |
| `em_preparacao` | `enviado`, `cancelado` | Sim | Não |
| `enviado` | `entregue`, `cancelado` | Sim | Não |
| `entregue` | *(nenhum)* | Não | **Sim** |
| `cancelado` | *(nenhum)* | Não | **Sim** |

### Ordem de Verificação no `PATCH /pedidos/:id/status`

O endpoint `PATCH /pedidos/:id/status` executa as validações rigorosamente na seguinte ordem:

1. **Existência do ID (`404 Not Found`)**: Verifica primeiro se o `:id` corresponde a um pedido existente. Se não existir (ou for inválido como `"abc"`), retorna `404` imediatamente, **antes** de validar o corpo da requisição.
2. **Formato do Body e Validade do Status (`400 Bad Request`)**: Verifica se o body é um objeto válido, se o campo `status` foi informado e se pertence à lista oficial de status aceitos.
3. **Regra de Transição (`400 Bad Request`)**: Verifica se a mudança do `status` atual para o novo `status` é permitida pela máquina de estados (transições para o mesmo status atual ou saídas de estados finais também retornam `400`).
4. **Atualização (`200 OK`)**: Persiste o novo status e retorna o objeto completo do pedido atualizado.

---

## 8. Tratamento Centralizado de Erros

Todos os erros da API retornam respostas padronizadas em JSON através dos middlewares `src/middlewares/notFound.js` e `src/middlewares/errorHandler.js`:

- **`400 Bad Request` (Erro de validação ou transição inválida)**:
  ```json
  {
    "erro": "Dados inválidos",
    "detalhes": [
      "cliente é obrigatório e não pode ser vazio"
    ]
  }
  ```
- **`400 Bad Request` (JSON malformado no corpo da requisição)**:
  ```json
  {
    "erro": "JSON inválido"
  }
  ```
- **`404 Not Found` (Pedido não encontrado ou rota inexistente)**:
  ```json
  {
    "erro": "Pedido não encontrado"
  }
  ```
  ou
  ```json
  {
    "erro": "Rota não encontrada"
  }
  ```
- **`500 Internal Server Error` (Erro inesperado)**:
  Qualquer falha não prevista é capturada pelo `errorHandler`, registrada internamente no log do servidor e respondida com mensagem genérica, **sem jamais vazar stack trace ou mensagens internas**:
  ```json
  {
    "erro": "Erro interno do servidor"
  }
  ```

---

## 9. Testes Automatizados

A suíte de testes foi construída com **Jest** e **Supertest** e está dividida em:

- **`tests/pedidos.service.test.js` (Testes Unitários)**:
  Testa isoladamente as funções do `pedidos.service.js`, cobrindo criação válida, `trim` no nome do cliente, rejeição de valores inválidos (strings numéricas, zero, negativos, `NaN`), rejeição de termos em maiúsculas, busca por ID e todas as transições válidas e inválidas de status.
- **`tests/pedidos.routes.test.js` (Testes de Integração)**:
  Testa a aplicação HTTP completa via `Supertest` sem precisar abrir porta de rede, validando status codes (`201`, `200`, `400`, `404`, `500`), formato dos JSONs de resposta, ordem de verificação no `PATCH`, tratamento de JSON malformado, rota inexistente e simulação (mock) de erro interno `500`.

Para executar os testes:
```bash
npm test
```

---

## 10. Evidências e Coleção Postman

- **Coleção Postman**: Disponível em [`postman/pedidos.postman_collection.json`](postman/pedidos.postman_collection.json). Basta importá-la no Postman (já configurada com a variável `{{baseUrl}}` = `http://localhost:3000`).
- **Roteiro de Evidências (Prints)**: Consulte o guia detalhado em [`evidencias/README.md`](evidencias/README.md) para capturar e salvar os 5 prints obrigatórios (`01-criacao.png` a `05-atualizacao.png`).

---

## 11. Uso de IA no Desenvolvimento

<!-- REVISAR: os alunos devem ajustar esta seção para refletir exatamente o que fizeram -->

Durante o desenvolvimento deste projeto acadêmico, o grupo utilizou a ferramenta de Inteligência Artificial **Antigravity** como assistente de programação em par (*pair programming*) para apoiar a organização da arquitetura em camadas, geração do esqueleto inicial de código, elaboração de cenários de testes no Jest/Supertest e estruturação da documentação.

Todo o código gerado foi lido, revisado, testado e validado pelos integrantes do grupo (**Wallace Coimbra, Nicole Henrique, Javier Jose Garcia e Mateus Sepulvida**) para garantir que cada camada permanecesse simples, legível e fiel aos requisitos da disciplina.

### Exemplo de decisão técnica revisada pelo grupo
- **Validação estrita do campo `valor`**: Durante a definição das validações do `POST /pedidos`, analisamos a possibilidade sugerida inicialmente de converter strings numéricas (como `"valor": "350"`) usando `Number(dados.valor)`. O grupo **rejeitou** essa abordagem e decidiu exigir estritamente `typeof dados.valor === 'number'`, rejeitando strings numéricas com HTTP `400`. Essa decisão garante conformidade estrita com a regra de negócio de que o valor deve ser numérico no JSON e evita conversões implícitas indesejadas (como `""` ou `true` virarem `0` ou `1`).

---

## 12. Decisões de Projeto Documentadas

1. **IDs não numéricos ou fora do padrão retornam `404 Not Found`**:
   Em `GET /pedidos/:id` e `PATCH /pedidos/:id/status`, parâmetros como `"abc"`, `"1.5"`, `"0"` ou `"-5"` são tratados como identificadores que não correspondem a nenhum pedido cadastrado, resultando em `404 Not Found` (`{"erro": "Pedido não encontrado"}`).
2. **Ordem de verificação no `PATCH /pedidos/:id/status`**:
   A existência do pedido pelo ID é verificada **antes** da validação do corpo da requisição. Assim, um `PATCH /pedidos/999/status` retorna `404 Not Found` mesmo que o body esteja vazio ou contenha um status inválido.
3. **Campos extras ignorados na criação (`POST /pedidos`)**:
   Caso o cliente envie propriedades adicionais no body (como `"id": 500`, `"status": "entregue"` ou `"desconto": 10`), elas são ignoradas pelo service. O `id` é sempre atribuído sequencialmente pelo repositório e o `status` inicial é sempre `"recebido"`.
4. **Rejeição de `valor` como string**:
   O campo `valor` deve ser enviado como número JSON (`350` ou `99.90`). Strings como `"350"` resultam em `400 Bad Request`.
5. **Armazenamento em memória iniciado vazio**:
   O repositório inicia com array vazio (`[]`), sem *seed* automático, para garantir comportamento previsível tanto nos testes automatizados quanto nos testes manuais via Postman.
