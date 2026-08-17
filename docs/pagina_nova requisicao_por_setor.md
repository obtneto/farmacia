# Pagina Nova Requisição por Setor

### Pagina Nova Requisição por Setor

- Header da Pagina

- Area I - Dados da Requisição
      1 - Select Setor;
      2 - select do tipo requisição (só um elemento option value='1' text='Dispensação')
      3 - select locais
      4 - select depositos
      5 - input date data atual do sistema (desabilitado)

- Area II - Grid de Itens
      1 - Botao Incluir Item (abre modal de seleção de medicações)
      2 - table dados (vazio no inicio)
          primeira coluna medicamento_id
          segunda coluna Descrição medicamento
          terceira coluna Lote
          quarta coluna Quantidade
          quinta coluna  validade medicamento
          sexta coluna Ação: button Excluir Item
          
## Regra de construção da pagina

1. Usar o padrão visual do projeto ja existente
2. Usar o padrão de framework CSS RSuite

## Modal Seleção de Medicações

      1 - Select Tipos de medicamentos (api /parametros/tipos_medicamentos/listar-ativos/:pesq)
      2 - table dados vindos da api estoque/listar/:pesq/:dep_id/:med_tipo_codigo (:med_tipo_codigo vindo do select, :dep_id vindo do select de depositos do header)
          primeira coluna checkbox
          segunda coluna Codigo: id medicamento med_id
          terceira coluna Descrição med_descr
          quarta coluna Unidade med_und
          quinta coluna Lote med_lote
          sexta coluna Saldo Disponivel saldo_disponivel
          setima coluna Quantidade Digitada
          oitava coluna Ação: button Adicionar
          
- Footer Modal
      1 - button Cancelar
      2 - button Adicionar

Observação : A integração com a API é mesma da pagina de requisição por paciente (excluindo os campos de paciente)