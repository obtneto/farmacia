# Pagina de solicitações encerradas de Transferências

## Area I - Header da pagina

- Titulo: "Solicitações de Transferências Encerradas"

## Area II - Filtro

- Campo Date para Data Inicial - Data primeiro dia do mês atual
- Campo Date para Data Final - Data atual do sistema
- Botão Pesquisar

## Area III - Lista de solicitações encerradas

- Tabela com colunas:

    - Numero da Solicitação (sol_id)
    - Data da Solicitação (sol_data)
    - Depósito Origem (dep_descr)
    - Depósito Destino (dep_descr)
    - Usuário que criou (sol_user_create)
    - Usuário que aprovou (sol_user_aprov)
    - Data aprovação (sol_date_aprov)
    - Ação: Botão Detalhes da Solicitação (itens da solicitação)


## Regra de construção da pagina

1. Usar o padrão visual do projeto ja existente
2. Usar o padrão de framework CSS RSuite
3. api /solicitacoes/listar_encerradas/:data_ini/:data_fim
4. skills ui-ux-pro-max e react-best-practices
5. mcp context7 e playwright para validação