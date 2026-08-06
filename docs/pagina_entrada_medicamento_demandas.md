# Pagina Entrada de Mercadoria de Demandas

### Pagina Entrada de Mercadoria de Demandas

- Header da Pagina
- Section
      1 - input text Documento
      2 - select Fornecedor (rota backend: /parametros/forncedores/listar_ativos/:pesq)
      3 - select Depositos (rota backend: /parametros/depositos/listar-ativos/:pesq)
      4 - input text Num Paciente
      5 - button Pesquisar paciente (com um modal de pesquisa paciete)
      6 - input text Nome Paciente
- Section
      1 - table dados adicionado pelo modal Entrada Item Mercadoria
- Footer
      1 - button Adicionar item
      2 - button Salvar


### Modal Entrada de Itens Mecardoria

- Input's:
      1 - select Tipo Medicamento (option do select obtido de frontend/opcoes.js)
      2 - select Medicamentos (filtrado por Tipo Medicamento rota backend: /parametros/medicamentos/listar/:pesq)
      3 - input text Lote
      4 - input date Validade
      5 - input number Quantidade

- Buttons
      1 - Cancelar
      2 - Adicionar

## Regra de construção da pagina

1. Usar o padrão visual do projeto para: Pagina, modal, componentes, buttons, filtros, tables
2. Usar o padrão de framework CSS RSuite