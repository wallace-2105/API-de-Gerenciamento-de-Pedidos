# Guia para Geração das Evidências de Testes (Prints no Postman)

> **ATENÇÃO:** Os prints devem ser tirados manualmente por um dos integrantes do grupo com a **API rodando localmente** (`npm start`) e devem refletir o comportamento real da aplicação. Salve todas as capturas de tela dentro desta pasta (`evidencias/`) com os nomes exatos listados abaixo.

---

## Pré-requisitos antes de capturar os prints

1. No terminal, na raiz do projeto, instale as dependências e inicie o servidor:
   ```bash
   npm install
   npm start
   ```
   *(O terminal exibirá `Servidor rodando em http://localhost:3000`)*

2. Abra o **Postman** e importe o arquivo da coleção localizada em:
   ```
   postman/pedidos.postman_collection.json
   ```

3. Em **CADA captura de tela (print)**, certifique-se de que estejam visíveis na janela do Postman:
   - O **Método HTTP** (`POST`, `GET`, `PATCH`) e a **URL completa** (`http://localhost:3000/...`);
   - O **Corpo da requisição (Body)** enviado (quando aplicável, em `POST` e `PATCH`);
   - O **Código de Status HTTP** retornado (ex.: `201 Created`, `400 Bad Request`, `200 OK`, `404 Not Found`);
   - O **Corpo da resposta (Response Body)** em JSON.

---

## Ordem Exata de Execução e Captura dos 5 Prints

Execute as requisições da coleção **exatamente nesta ordem** (pois o armazenamento é em memória e o print 03 e 05 dependem do pedido criado no print 01):

### 1. `01-criacao.png` — Criação válida de pedido (HTTP 201)
- **Requisição na coleção:** `01 Criação válida (201)`
- **Método e URL:** `POST http://localhost:3000/pedidos`
- **Body (JSON) enviado:**
  ```json
  {
    "cliente": "Wallace Coimbra",
    "tipo": "entrega",
    "valor": 350,
    "prioridade": "alta"
  }
  ```
- **O que deve aparecer na resposta:**
  - Status HTTP: **`201 Created`**
  - JSON retornado com `"id": 1`, `"status": "recebido"` e os dados de `"Wallace Coimbra"`.
- **Arquivo a salvar:** `evidencias/01-criacao.png`

---

### 2. `02-validacao.png` — Erro de validação na criação (HTTP 400)
- **Requisição na coleção:** `02 Validação inválida (400)`
- **Método e URL:** `POST http://localhost:3000/pedidos`
- **Body (JSON) enviado:**
  ```json
  {
    "cliente": "",
    "tipo": "drone",
    "valor": -50,
    "prioridade": "urgente"
  }
  ```
- **O que deve aparecer na resposta:**
  - Status HTTP: **`400 Bad Request`**
  - JSON retornado com `"erro": "Dados inválidos"` e o array `"detalhes"` listando os erros de validação de cada campo.
- **Arquivo a salvar:** `evidencias/02-validacao.png`

---

### 3. `03-listagem.png` — Listagem de pedidos cadastrados (HTTP 200)
- **Requisição na coleção:** `03 Listagem (200)`
- **Método e URL:** `GET http://localhost:3000/pedidos`
- **O que deve aparecer na resposta:**
  - Status HTTP: **`200 OK`**
  - JSON retornado contendo o array `[ ... ]` com pelo menos o pedido de ID `1` criado no passo 01 (você também pode cadastrar mais pedidos em nome de `Nicole Henrique`, `Javier Jose Garcia` e `Mateus Sepulvida` antes de tirar o print para enriquecer a listagem).
- **Arquivo a salvar:** `evidencias/03-listagem.png`

---

### 4. `04-consulta-inexistente.png` — Consulta de pedido inexistente (HTTP 404)
- **Requisição na coleção:** `04 Consulta inexistente (404)`
- **Método e URL:** `GET http://localhost:3000/pedidos/999`
- **O que deve aparecer na resposta:**
  - Status HTTP: **`404 Not Found`**
  - JSON retornado:
    ```json
    {
      "erro": "Pedido não encontrado"
    }
    ```
- **Arquivo a salvar:** `evidencias/04-consulta-inexistente.png`

---

### 5. `05-atualizacao.png` — Atualização válida de status (HTTP 200)
- **Requisição na coleção:** `05 Atualização de status válida (200)`
- **Método e URL:** `PATCH http://localhost:3000/pedidos/1/status`
- **Body (JSON) enviado:**
  ```json
  {
    "status": "em_preparacao"
  }
  ```
- **O que deve aparecer na resposta:**
  - Status HTTP: **`200 OK`**
  - JSON retornado mostrando o pedido completo de ID `1` atualizado com `"status": "em_preparacao"`.
- **Arquivo a salvar:** `evidencias/05-atualizacao.png`

---

## Checklist Final das Evidências

Antes de fazer o `git add evidencias/` e o `git commit`, confira se a pasta `evidencias/` possui todos os 5 arquivos:
- [ ] `evidencias/01-criacao.png`
- [ ] `evidencias/02-validacao.png`
- [ ] `evidencias/03-listagem.png`
- [ ] `evidencias/04-consulta-inexistente.png`
- [ ] `evidencias/05-atualizacao.png`
