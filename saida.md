Resumo objetivo

- Implementada rota `GET /solicitacoes/imprimir/:sol_id` em `backend/routes/routes_solicitacoes.ts`.
- Implementada impressao PDF inline em `backend/controllers/controller_solicitacoes.ts` com cabecalho da solicitacao, tabela de itens e bloco final de assinaturas `FARMACIA` e `ALMOXARIFADO`.
- Reaproveitado o padrao de PDF do projeto com `pdfmake`, `Buffer` e `Content-Disposition: inline`.
- Ajustado `backend/model/dao_itens_solicitacoes.ts` para listar codigo, medicamento, marca e unidade necessarios ao layout.
- Atualizado `backend/swagger/swagger-docs.js` para tratar a nova rota como retorno `application/pdf`.

Validacoes

- `./node_modules/.bin/tsc --noEmit -p tsconfig.json` em `backend`
- `npm --prefix backend run swagger:docs`

Observacoes

- `qtde atend` usa a mesma quantidade solicitada quando a solicitacao esta encerrada (`sol_status = 1`), seguindo o fluxo atual de encerramento que transfere integralmente `iso_med_qtde`.
- Quando o dado nao existe no schema/registro atual, o PDF usa `-`.
