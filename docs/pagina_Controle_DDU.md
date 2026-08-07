# Pagina Controle DDU's

### Pagina Listar Controle DDU's

- Header da Pagina

- Area I
      1 - campo Data Inicial (input date) com valor default do dia primeiro do mes atual
      2 - campo Data Final (input date) com valor default do dia atual
      3 - campo Pesquisa (input text) com valor default *
      4 - campo Status (select) com valor default 0
      5 - button Pesquisar
      
- Area II
      1 - table dados vindos da api /controle-ddu/listar/:pesq/:data_ini/:data_fin/:cdd_status
          primeira coluna Data: cdd_date
          segunda coluna Requisição: cdd_req_num
          terceira coluna Paciente: paciente
          quarta coluna Status: cdd_status
          quinta coluna Ação: button Editar DDU
          
      
- Modal Editar DDU
      1 - table (a table deve possuir scroll e paginação de 20 em 20) dados vindos da api /controle-ddu/listar-itens/:req_num/:pesq
          primeira coluna checkbox
          segunda coluna Codigo: med_id
          terceira coluna Descrição: med_descr
          quarta coluna Lote: med_lote
          quinta coluna Quantidade Solicitada: med_qtde
          sexta coluna Inputt Number Quantidade Digitada: med_qtde_digitada
          setima coluna Ação: button Excluir Item (api /controle-ddu/excluir-item)
          
- Footer Modal
      1 - button Cancelar
      2 - button Salvar (api /controle-ddu/atualizar-item)
      
## Regra de construção da pagina

1. Usar o padrão visual do projeto ja existente
2. Usar o padrão de framework CSS RSuite
