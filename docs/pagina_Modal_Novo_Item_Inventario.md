# Modal Novo Item Inventario

### Header da Pagina

#### - Area I
- campo Text para pesquisar descrição de medicamento
      
#### - Area II

##### - Area dos Input's para inserção de dados do item
- coluna ID: med_id disabled ao lado um button pesquisar medicamento com icon de uma lupa
- coluna Descrição: med_descr disabled
- coluna Descr Coml: med_descr_coml disabled
- coluna Unidade: med_und disabled
- coluna Lote: med_lote 
- coluna Data de Validade: med_dt_validade 
- coluna Quantidade: med_qtd


#### - Footer
- botao Adicionar
- button Fechar


#### Modal de Pesquisar medicamentos

##### - table dados vindos da api /medicamentos/listar/ativos/:pesq/:med_tipo_codigo
- coluna ID: med_id
- coluna Descrição: med_descr
- coluna Descr Coml: med_descr_coml
- coluna Unidade: med_und
- coluna Ações: button selecionar
    
## Regra de construção da pagina

1. Usar o padrão visual do projeto ja existente
2. Usar o padrão de framework CSS RSuite
