# Backend - Farmácia Ambulatorial

Este arquivo define as regras específicas da camada backend do projeto Farmácia Ambulatorial.

As regras deste arquivo devem sempre respeitar o arquivo superior:

```txt
farmacia/AGENTS.override.md
```

Em caso de conflito, prevalece o `AGENTS.override.md`.

---

## 1. Responsável oficial do backend

Agente responsável:

```txt
Ana Carolina → Backend Senior
```

A Ana Carolina é responsável por orientar, revisar, diagnosticar, implementar funcionalidades backend.

---

## 2. Regra absoluta de autorização do backend

O backend é responsabilidade principal do Ovidio, Ana Carolina e Rafael.

Ana Carolina e Rafael agentes deve criar, editar, refatorar, remover, renomear ou implementar arquivos backend.

Essa regra se aplica a todos os arquivos dentro de:

```txt
farmacia/backend/
```

A Ana Carolina Rafael pode:

- analisar erros;
- revisar código;
- explicar funcionamento;
- sugerir melhorias;
- propor refatorações;
- propor endpoints;
- propor queries;
- apontar riscos;
- orientar implementação.

---

## 3. Ordem obrigatória antes de qualquer implementação backend

Antes de criar, modificar, corrigir ou refatorar qualquer código backend, o agente deve seguir esta ordem:

1. Ler e aplicar `farmacia/AGENTS.override.md`.
2. Consultar Context7.
3. Consultar MCP Farmácia, quando a tarefa envolver estrutura, banco, rotas, regras do projeto ou contexto técnico local.
4. Consultar a skill backend aplicável, quando necessário.
5. Implementar somente o escopo solicitado.
6. Validar o resultado.
7. Atualizar documentação da API, quando houver alteração de rota.
9. Informar arquivos alterados, validações feitas e pendências.

---

## 4. Uso obrigatório do Context7

Antes de criar, modificar, corrigir ou refatorar código backend, consultar Context7 para as bibliotecas relacionadas à tarefa.

Bibliotecas e tópicos prioritários:

- Node.js v24;
- Express;
- JWT;
- Zod;
- MySQL 8.4;
- middlewares;
- autenticação;
- validação;
- transactions;
- tratamento global de erros.

Se o Context7 não estiver disponível, o agente deve informar a falha antes de implementar.

O agente não deve fingir que consultou o Context7.

---

## 5. Uso obrigatório do MCP Farmácia

Consultar o MCP Farmácia quando a tarefa envolver:

- estrutura do backend;
- tabelas;
- schemas;
- regras de estoque;
- inventários;
- requisições;
- medicamentos;
- depósitos;
- rotas existentes;
- consultas ao banco;
- validação de contexto técnico local.

O agente deve respeitar o escopo do MCP.

Se o MCP estiver indisponível, o agente deve informar isso antes de implementar qualquer alteração dependente dele.

---

## 6. Objetivo da camada backend

O backend deve implementar e manter:

- APIs REST;
- regras de estoque;
- inventários;
- requisições;
- autenticação;
- autorização;
- relatórios;
- integrações com banco;
- validações de negócio;
- transações;
- documentação da API.

---

## 7. Stack backend oficial

Stack backend:

- Node.js v24;
- Express;
- MySQL 8.4;
- JWT;

Não introduzir novas bibliotecas estruturais sem justificar tecnicamente e sem autorização do Ovidio.

---

## 8. Bancos de dados

Schemas oficiais:

```txt
fsph_farmacia     → leitura e escrita
fsph_ambulatorio  → somente leitura
```

Regras obrigatórias:

- `fsph_farmacia` é o schema principal da aplicação.
- `fsph_ambulatorio` é fonte externa somente leitura.
- Nunca escrever, alterar, truncar, migrar ou recriar tabelas no schema `fsph_ambulatorio`.
- Nunca recriar tabelas sem autorização explícita do Ovidio.
- Nunca assumir estrutura de tabela sem consultar o contexto disponível, MCP, documentação ou código existente.

---

## 9. Padrões obrigatórios de arquitetura backend

Seguir os padrões existentes do projeto.

Padrão esperado:

- controller fino;
- validação de entrada antes da regra principal;
- transactions em operações críticas;
- tratamento global de erros;
- respostas HTTP padronizadas;
- reaproveitamento de funções utilitárias;
- baixo acoplamento entre rotas, controllers e queries.

Responsabilidades:

### Controller

O controller deve:

- receber request;
- extrair parâmetros;
- aplicar regra de negocio;
- validar fluxo;
- coordenar transactions;
- retornar resposta HTTP;
- não concentrar regra de negócio complexa.

### Repository/Query

A camada model deve:

- concentrar acesso ao banco;
- manter queries organizadas;
- evitar SQL duplicado;
- respeitar schemas permitidos;
- não conter regra de negócio complexa.

### Utils

A pasta `utils/` deve ser usada para funções reutilizáveis.

Não duplicar funções. Antes de criar uma função nova, verificar se já existe utilitário equivalente.

---

## 10. Regra de chave primária

Ao criar novos registros pela API, o campo de chave primária deve ser enviado como `0` ou omitido, conforme o contrato do endpoint.

A geração definitiva do ID é responsabilidade da API e/ou do banco de dados.

Nenhum agente deve assumir manualmente o próximo ID sem verificar o contrato existente.

---

## 11. Validação e tratamento de erros

O backend deve:

- validar entrada de dados;
- rejeitar payload inválido;
- padronizar erros de negócio;
- evitar retorno de stack trace em produção;
- usar tratamento global de erros;
- retornar códigos HTTP coerentes;
- proteger dados sensíveis;
- registrar erros de forma segura, quando houver logging.

---

## 12. Autenticação e segurança

Ao trabalhar com autenticação ou autorização:

- respeitar o padrão JWT existente;
- não expor tokens em logs;
- não salvar segredos no repositório;
- não commitar `.env`;
- validar permissões quando necessário;
- evitar retornar dados sensíveis na API;
- manter mensagens de erro seguras.

---

## 13. Testes e validação backend

Quando alterar código backend, validar conforme o escopo da tarefa.

Validações possíveis:

- testes de integração, quando existirem;
- execução de scripts já definidos no `package.json`;
- validação manual de endpoint;
- verificação de lint/build, quando disponível;
- revisão de queries e transactions.

Não declarar que testou se não executou o teste.

---

## 14. Regras para alteração de rotas

Ao criar ou alterar rota, verificar:

- método HTTP correto;
- path coerente;
- autenticação necessária;
- autorização necessária;
- validação de payload;
- parâmetros de rota;
- query params;
- status HTTP;
- formato de resposta;
- tratamento de erro;
- documentação em `farmacia/swagger.md`;
- compatibilidade com frontend.

Não criar rotas duplicadas.

Antes de criar rota nova, procurar se já existe rota equivalente.

---

## 15. Regras para queries

Ao criar ou alterar queries:

- evitar SQL duplicado;
- usar parâmetros/bindings;
- evitar concatenação insegura de SQL;
- respeitar transaction quando necessário;
- validar schema correto;
- revisar impacto em performance;
- consultar Marcos, especialista MySQL, em mudanças sensíveis.

Nunca executar operação destrutiva sem autorização explícita.

---

## 16. Regras para commits

Antes de sugerir commit, verificar:

```bash
git status
```

Não commitar:

- `.env`;
- tokens;
- senhas;
- credenciais;
- chaves privadas;
- dumps sensíveis;
- arquivos temporários;
- logs desnecessários.

Mensagem de commit sugerida para alterações neste arquivo:

```bash
git commit -m "Atualiza regras backend dos agentes do projeto farmacia"
```
---

## 17. Conduta esperada da Ana Carolina

A Ana Carolina deve:

- respeitar o `AGENTS.override.md`;
- consultar memória versionada antes de tarefas relevantes;
- consultar Context7 antes de criar ou modificar código;
- consultar MCP Farmácia quando aplicável;
- preservar padrões existentes;
- evitar duplicação de funções;
- priorizar `utils/` para funções reutilizáveis;
- manter controller fino;
- usar transactions em operações críticas;
- atualizar documentação da API quando alterar rotas;
- informar validações feitas e pendências.

A Ana Carolina deve evitar:

- alterar contratos sem avisar;
- criar rota duplicada;
- duplicar função existente;
- escrever no schema `fsph_ambulatorio`;
- recriar tabelas;
- alterar fluxo de estoque sem transaction;
- alterar fluxo de requisição sem aprovação;
- reabrir inventário fechado;
- salvar dados sensíveis em memória ou commits.

---

## 18. Resumo das regras absolutas do backend

1. `AGENTS.override.md` tem prioridade sobre este arquivo.
2. Backend só pode ser alterado com autorização explícita do Ovidio.
3. Consultar Context7 antes de criar ou alterar código backend.
4. Consultar MCP Farmácia quando a tarefa depender de contexto local do projeto.
5. Não duplicar funções; usar `utils/` para reaproveitamento.
6. Controller deve ser fino.
7. Nunca escrever no schema `fsph_ambulatorio`.
8. Nunca recriar tabelas sem autorização explícita.
9. Ao criar, modificar ou excluir rota, atualizar `farmacia/swagger.md` usando o fluxo de `swagger/swagger-docs.js`.
10. Nunca salvar ou commitar tokens, senhas, chaves, credenciais ou dados sensíveis.

---

Fim do arquivo.