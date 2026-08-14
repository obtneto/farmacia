# Pagina Controle DDU's

### Pagina Listar Controle DDU's

- Header da Pagina

#### - Area I
- campo Data Inicial (input date) com valor default do dia primeiro do mes atual
- campo Data Final (input date) com valor default do dia atual
- campo Pesquisa (input text) com valor default *
- campo Status (select) com valor default 0
- button Pesquisar
      
#### - Area II
##### - table dados vindos da api /controle-ddu/listar/:pesq/:data_ini/:data_fin/:cdd_status
- primeira coluna Data: cdd_date
- segunda coluna Requisição: cdd_req_num
- terceira coluna Paciente: paciente
- quarta coluna Status: cdd_status
- quinta coluna Ação: button Editar DDU

#### - Modal Editar DDU

#### table (a table deve possuir scroll e paginação de 20 em 20)dados vindos da api /controle-ddu/listar-itens/:req_num/:pesq
- primeira coluna Codigo: med_id
- segunda coluna Descrição: med_descr
- terceira coluna Lote: med_lote
- quarta coluna Quantidade Solicitada: med_qtde
- quinta coluna Inputt Number Quantidade Digitada: med_qtde_digitada
          
#### - Footer Modal
- button Fechar


### Regra de construção da pagina

1. Usar o padrão visual do projeto ja existente
2. Usar o padrão de framework CSS RSuite
