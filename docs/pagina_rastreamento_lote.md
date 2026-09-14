## Pagina Rastreamento de Lote

- Header da Pagina

#### - Area I
- campo Lote (input text) com placeholder Digite o número do Lote
- button Pesquisar (só icone de lupa) ao clicar deve buscar na api /requisicoes/itens_lote/:lote
- campo Medicamento (input text) só readonly com valor vindo da api /requisicoes/itens_lote/:lote
- campo Unidade (input text) com valor vindo da api /requisicoes/itens_lote/:lote
- Todos esses componentes devem ficar em linha
      
#### - Area II

##### - Form
- Label Quantidade Entrada e na mesma linha campo Quantidade Entrada (input number) (este campo deve ser somente leitura)
- Na linha abaixo outro Label Saldo Final e na mesma linha campo Saldo Final (input number) (este campo deve ser somente leitura)
- Na linha abaixo outro Label Quantidade Saidda e na mesma linha campo Quantidade Saída (input number) (este campo deve ser somente leitura)
- Ao lado de cada input number deve um button com o icone de detalhes


### Regra de construção da pagina

1. Usar o padrão visual do projeto ja existente
2. Usar o padrão de framework CSS RSuite
