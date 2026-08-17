# Pagina Novo Inventario

### Pagina Novo Inventario

- Header da Pagina

#### - Area I
- campo Data Inventario (input date) com valor default do dia atual
- select Depositos (rota api /parametros/depositos/listar/:pesq)
- select Tipo Medicamento (rota api /parametros/tipos_medicamentos/listar-ativos/:pesq)
- select Tipo Inventario (options: Parcial e Total)

      
#### - Area II

##### - table dados vindos da api /estoque/listar/:pesq/:dep_id/:med_tipo_codigo 
- coluna checkbox: se tipo inventario for Parcial habilitar, se Total desabilitar e marcar todas.
- coluna ID: med_id
- coluna Descrição: med_descr
- coluna Descricao Comercial: med_descr_coml
- coluna Unidade: med_und
- coluna Lote: med_lote
- coluna Validade: med_validade


#### - Footer Modal
- button Fechar
- button Criar Inventario


### Regra de construção da pagina

1. Usar o padrão visual do projeto ja existente
2. Usar o padrão de framework CSS RSuite
