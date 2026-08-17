# Pagina Listar Inventarios

### Pagina Listar Inventarios

- Header da Pagina

#### - Area I
- campo Data Inicial de Inventario (input date) com valor default 01/01/1970
- campo Data Final de Inventario (input date) com valor default do dia atual
- select Depositos (rota api /parametros/depositos/listar/:pesq)

      
#### - Area II

##### - table dados vindos da api /inventarios/listar/:date_ini/:date_fin/:dep_id
- coluna ID: inv_id
- coluna Numero: inv_num
- coluna Data: inv_date
- coluna Tipo: tipo_descr
- coluna Deposito: dep_descr
- coluna Status: inv_status
- coluna Tipo de Inventário: inv_tipo


#### - Footer
- button Fechar


### Regra de construção da pagina

1. Usar o padrão visual do projeto ja existente
2. Usar o padrão de framework CSS RSuite
