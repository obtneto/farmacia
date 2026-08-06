# Pagina Listar Solicitação Abertas

### Pagina Listar Solicitação Abertas

- Header da Pagina

- Area I
      1 - table dados com dados vindos da api /solicitacoes/listar_abertas/
      2 - button Excluir Solicitação (api /solicitacoes/excluir/{sol_id})
      
## Regra de construção da pagina

1. Usar o padrão visual do projeto ja existente
2. Usar o padrão de framework CSS RSuite

## Modal Digitação

      1 - table dados vindos da api /itens-solicitacoes/listar/:iso_sol_id
          primeira coluna checkbox
          segunda coluna Codigo: iso_med_id
          terceira coluna Descrição: med_descr
          quarta coluna Lote: iso_med_lote
          quinta coluna Quantidade Solicitada: iso_med_qtde
          sexta coluna Inputt Number Quantidade Digitada: iso_qtde_digitada
          setima coluna Ação: button Excluir Item
          
- Footer Modal
      1 - button Cancelar
      2 - button Salvar (api /solicitacoes/encerrar)