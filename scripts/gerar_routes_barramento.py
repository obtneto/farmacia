from openpyxl import Workbook

APP_ID = 12

# (metodo, nome, caminho, descricao)
# Params Express :x -> [^/]+  (padrao Barramento)

already = [
    ("GET", "listar_notificacoes_SisStock", "/notificacoes/listar", "Listar notificacoes"),
    ("GET", "filtrar_notificacoes_SisStock", "/notificacoes/stream", "Stream SSE de notificacoes"),
    ("GET", "listar_dashboard_por_data_SisStock", "/dashboard/listar/[^/]+", "Listar dashboard por data"),
    ("GET", "alerta_validade_estoque_SisStock", "/estoque/alerta_validade", "Alerta de validade do estoque"),
    ("GET", "listar_demandas_SisStock", "/demandas-especificas/listar/", "Listar demandas especificas"),
    ("GET", "listar_parametros_medicamentos_SisStock", "/parametros/medicamentos/listar/[^/]+", "Listar medicamentos"),
    ("GET", "listar_depositos_ativos_SisStock", "/parametros/depositos/listar-ativos/[^/]+", "Listar depositos ativos"),
    ("GET", "listar_tiposMedicamentos_SisStock", "/parametros/tipos_medicamentos/listar/[^/]+", "Listar tipos de medicamentos"),
    ("GET", "listar_tipoMedicamentos_ativos_SisStock", "/parametros/tipos_medicamentos/listar-ativos/[^/]+", "Listar tipos de medicamentos ativos"),
    ("GET", "listar_depositos_SisStock", "/parametros/depositos/listar/[^/]+", "Listar depositos"),
    ("GET", "listar_solicitacoesAbertas_SisStock", "/solicitacoes/listar_abertas/", "Listar solicitacoes abertas"),
    ("GET", "listar_solicitacoesEncerradas_SisStock", "/solicitacoes/listar_encerradas/[^/]+/[^/]+", "Listar solicitacoes encerradas"),
    ("GET", "listar_fornecedoresAtivos_SisStock", "/parametros/fornecedores/listar_ativos/[^/]+", "Listar fornecedores ativos"),
    ("GET", "listar_entradaMedicamentos_SisStock", "/entradas/listar/[^/]+/[^/]+/[^/]+", "Listar entradas de medicamentos"),
    ("GET", "configuracoes_Medicamentos_SisStock", "/settings", "Listar configuracoes"),
    ("GET", "listar_demandaEspecifica_paciente_SisStock", "/demandas-especificas/listar-pacientes", "Listar pacientes de demandas especificas"),
    ("GET", "listar_locaisAtivos_SisStock", "/parametros/locais/listar_ativos/[^/]+", "Listar locais de requisicao ativos"),
    ("GET", "listar_setoresAtivos_SisStock", "/parametros/setores/listar-ativos/[^/]+", "Listar setores ativos"),
    ("GET", "listar_requisicoesNaoAprovadas_SisStock", "/requisicoes/naoaprovadas", "Listar requisicoes nao aprovadas"),
    ("GET", "listar_requisicoes_periodo_SisStock", "/requisicoes/listar/[^/]+/[^/]+/[^/]+", "Listar requisicoes por periodo"),
    ("GET", "listar_controleDDU_SisStock", "/controle-ddu/listar/[^/]+/[^/]+/[^/]+/[^/]+", "Listar controle DDU"),
    ("GET", "listar_requisicoesPorLote_SisStock", "/requisicoes/rastrear_lote/[^/]+", "Rastrear requisicoes por lote"),
    ("GET", "listar_boname_SisStock", "/parametros/boname/listar/[^/]+", "Listar boname"),
    ("GET", "listar_fornecedores_SisStock", "/parametros/fornecedores/listar/[^/]+", "Listar fornecedores"),
    ("GET", "listar_requisicoesLocais_SisStock", "/parametros/locais/listar/[^/]+", "Listar locais de requisicao"),
    ("GET", "listar_setores_SisStock", "/parametros/setores/listar/[^/]+", "Listar setores"),
    ("GET", "listar_tiposRequisicoes_SisStock", "/parametros/tipos_requisicoes/listar", "Listar tipos de requisicoes"),
    ("GET", "listar_diagnosticos_SisStock", "/parametros/diagnosticos/listar/[^/]+", "Listar diagnosticos"),
    ("GET", "listar_diagnosticosAtivos_SisStock", "/parametros/diagnosticos/listar_ativos/[^/]+", "Listar diagnosticos ativos"),
    ("GET", "listar_pacientes_SisStock", "/pacientes/listar_pacientes/[^/]+", "Listar pacientes"),
    ("GET", "listar_itensDemandas_SisStock", "/demandas-especificas/listar-itens-demandas/[^/]+", "Listar itens de demandas"),
]

missing = [
    ("POST", "publicar_notificacao_SisStock", "/notificacoes/publicar", "Publicar notificacao"),
    ("PATCH", "marcar_notificacao_lida_SisStock", "/notificacoes/read/[^/]+", "Marcar notificacao como lida"),
    ("DELETE", "limpar_notificacoes_SisStock", "/notificacoes/limpar", "Limpar notificacoes"),
    ("DELETE", "remover_notificacao_SisStock", "/notificacoes/[^/]+", "Remover notificacao"),
    ("GET", "listar_settings_SisStock", "/settings/listar", "Listar settings"),
    ("GET", "buscar_setting_SisStock", "/settings/buscar/[^/]+", "Buscar setting por chave"),
    ("POST", "salvar_setting_SisStock", "/settings/salvar", "Salvar setting"),
    ("DELETE", "excluir_setting_SisStock", "/settings/excluir/[^/]+", "Excluir setting"),
    ("GET", "listar_bonameAtivos_SisStock", "/parametros/boname/listar_ativos/[^/]+", "Listar boname ativos"),
    ("GET", "buscar_boname_SisStock", "/parametros/boname/buscar/[^/]+", "Buscar boname"),
    ("GET", "imprimir_boname_SisStock", "/parametros/boname/imprimir/[^/]+", "Imprimir boname"),
    ("POST", "salvar_boname_SisStock", "/parametros/boname/salvar", "Salvar boname"),
    ("DELETE", "excluir_boname_SisStock", "/parametros/boname/excluir/[^/]+", "Excluir boname"),
    ("GET", "buscar_deposito_SisStock", "/parametros/depositos/buscar/[^/]+", "Buscar deposito"),
    ("POST", "salvar_deposito_SisStock", "/parametros/depositos/salvar", "Salvar deposito"),
    ("DELETE", "excluir_deposito_SisStock", "/parametros/depositos/excluir/[^/]+", "Excluir deposito"),
    ("GET", "buscar_tipoMedicamento_SisStock", "/parametros/tipos_medicamentos/buscar/[^/]+", "Buscar tipo de medicamento"),
    ("GET", "buscar_tipoMedicamentoCodigo_SisStock", "/parametros/tipos_medicamentos/buscar-codigo/[^/]+", "Buscar tipo por codigo"),
    ("POST", "salvar_tipoMedicamento_SisStock", "/parametros/tipos_medicamentos/salvar", "Salvar tipo de medicamento"),
    ("DELETE", "excluir_tipoMedicamento_SisStock", "/parametros/tipos_medicamentos/excluir/[^/]+", "Excluir tipo de medicamento"),
    ("GET", "buscar_tipoRequisicao_SisStock", "/parametros/tipos_requisicoes/buscar/[^/]+", "Buscar tipo de requisicao"),
    ("POST", "salvar_tipoRequisicao_SisStock", "/parametros/tipos_requisicoes/salvar", "Salvar tipo de requisicao"),
    ("DELETE", "excluir_tipoRequisicao_SisStock", "/parametros/tipos_requisicoes/excluir/[^/]+", "Excluir tipo de requisicao"),
    ("GET", "buscar_setor_SisStock", "/parametros/setores/buscar/[^/]+", "Buscar setor"),
    ("POST", "salvar_setor_SisStock", "/parametros/setores/salvar", "Salvar setor"),
    ("DELETE", "excluir_setor_SisStock", "/parametros/setores/excluir/[^/]+", "Excluir setor"),
    ("GET", "buscar_diagnostico_SisStock", "/parametros/diagnosticos/buscar/[^/]+", "Buscar diagnostico"),
    ("POST", "salvar_diagnostico_SisStock", "/parametros/diagnosticos/salvar", "Salvar diagnostico"),
    ("DELETE", "excluir_diagnostico_SisStock", "/parametros/diagnosticos/excluir/[^/]+", "Excluir diagnostico"),
    ("GET", "listar_medicamentosAtivosPorTipo_SisStock", "/parametros/medicamentos/listar/ativos/[^/]+/[^/]+", "Listar medicamentos ativos por tipo"),
    ("GET", "buscar_medicamento_SisStock", "/parametros/medicamentos/buscar/[^/]+", "Buscar medicamento"),
    ("POST", "salvar_medicamento_SisStock", "/parametros/medicamentos/salvar", "Salvar medicamento"),
    ("DELETE", "excluir_medicamento_SisStock", "/parametros/medicamentos/excluir/[^/]+", "Excluir medicamento"),
    ("GET", "buscar_fornecedor_SisStock", "/parametros/fornecedores/buscar/[^/]+", "Buscar fornecedor"),
    ("POST", "salvar_fornecedor_SisStock", "/parametros/fornecedores/salvar", "Salvar fornecedor"),
    ("DELETE", "excluir_fornecedor_SisStock", "/parametros/fornecedores/excluir/[^/]+", "Excluir fornecedor"),
    ("GET", "buscar_local_SisStock", "/parametros/locais/buscar/[^/]+", "Buscar local de requisicao"),
    ("POST", "salvar_local_SisStock", "/parametros/locais/salvar", "Salvar local de requisicao"),
    ("DELETE", "excluir_local_SisStock", "/parametros/locais/excluir/[^/]+", "Excluir local de requisicao"),
    ("GET", "buscar_requisicao_SisStock", "/requisicoes/buscar/[^/]+", "Buscar requisicao"),
    ("GET", "imprimir_requisicao_SisStock", "/requisicoes/imprimir/[^/]+", "Imprimir requisicao"),
    ("POST", "salvar_requisicao_SisStock", "/requisicoes/salvar", "Salvar requisicao"),
    ("POST", "salvar_devolucao_requisicao_SisStock", "/requisicoes/salvar_devolucao", "Salvar devolucao de medicamento"),
    ("POST", "aprovar_requisicao_SisStock", "/requisicoes/aprovar/[^/]+", "Aprovar requisicao"),
    ("PUT", "atualizar_item_requisicao_SisStock", "/requisicoes/itens/[^/]+", "Atualizar item de requisicao"),
    ("DELETE", "excluir_item_requisicao_SisStock", "/requisicoes/itens/[^/]+", "Excluir item de requisicao"),
    ("POST", "reprovar_requisicao_SisStock", "/requisicoes/reprovar", "Reprovar requisicao"),
    ("GET", "buscar_requisicao_devolucao_SisStock", "/requisicoes/buscar_para_devolucao/[^/]+", "Buscar requisicao para devolucao"),
    ("GET", "listar_itens_requisicao_SisStock", "/requisicoes/listar_itens/[^/]+", "Listar itens da requisicao"),
    ("GET", "listar_itensLote_requisicao_SisStock", "/requisicoes/itens_lote/[^/]+", "Listar itens de requisicao por lote"),
    ("GET", "buscar_entrada_SisStock", "/entradas/buscar/[^/]+", "Buscar entrada"),
    ("GET", "listar_entradasNaoAprovadas_SisStock", "/entradas/listar-nao-aprovados/[^/]+/[^/]+/[^/]+/[^/]+", "Listar entradas nao aprovadas"),
    ("POST", "aprovar_entradas_SisStock", "/entradas/aprovar-entradas", "Aprovar entradas"),
    ("DELETE", "excluir_entrada_SisStock", "/entradas/excluir/[^/]+", "Excluir entrada"),
    ("GET", "listar_itens_entrada_SisStock", "/entradas/itens/[^/]+", "Listar itens da entrada"),
    ("PUT", "atualizar_item_entrada_SisStock", "/entradas/itens/[^/]+", "Atualizar item da entrada"),
    ("POST", "salvar_entrada_SisStock", "/entradas/salvar", "Salvar entrada"),
    ("GET", "listar_itensLote_entrada_SisStock", "/entradas/itens_lote/[^/]+", "Listar itens de entrada por lote"),
    ("GET", "buscar_demanda_SisStock", "/demandas-especificas/buscar/[^/]+", "Buscar demanda especifica"),
    ("GET", "imprimir_recibo_demanda_SisStock", "/demandas-especificas/imprimir-recibo/[^/]+", "Imprimir recibo de demanda"),
    ("POST", "salvar_demanda_SisStock", "/demandas-especificas/salvar", "Salvar demanda especifica"),
    ("DELETE", "excluir_demanda_SisStock", "/demandas-especificas/excluir/[^/]+", "Excluir demanda especifica"),
    ("POST", "salvar_entradas_demandas_SisStock", "/demandas-especificas/salvar_entradas_demandas", "Salvar entradas de demandas"),
    ("GET", "listar_estoque_SisStock", "/estoque/listar/[^/]+/[^/]+/[^/]+", "Listar estoque"),
    ("GET", "buscar_estoque_SisStock", "/estoque/buscar/[^/]+", "Buscar item de estoque"),
    ("POST", "salvar_estoque_SisStock", "/estoque/salvar", "Salvar estoque"),
    ("POST", "transferir_estoque_SisStock", "/estoque/transferir", "Transferir estoque"),
    ("PATCH", "bloquear_estoque_SisStock", "/estoque/bloquear/[^/]+", "Bloquear saldo"),
    ("PATCH", "desbloquear_estoque_SisStock", "/estoque/desbloquear/[^/]+", "Desbloquear saldo"),
    ("GET", "listar_itensLote_estoque_SisStock", "/estoque/itens_lote/[^/]+", "Listar itens de estoque por lote"),
    ("GET", "listar_movimentacoes_SisStock", "/movimentacoes/listar-movimentacoes/[^/]+/[^/]+/[^/]+/[^/]+", "Listar movimentacoes"),
    ("GET", "listar_movimentacoes_porMedicamento_SisStock", "/movimentacoes/listar-por-medicamento/[^/]+", "Listar movimentacoes por medicamento"),
    ("GET", "visualizar_paciente_SisStock", "/pacientes/visualizar_paciente/[^/]+", "Visualizar paciente"),
    ("GET", "buscar_itemDemanda_SisStock", "/itens-demandas/buscar_por_id/[^/]+", "Buscar item de demanda"),
    ("GET", "listar_itensDemandasAtivos_SisStock", "/itens-demandas/listar_ativos/[^/]+", "Listar itens de demanda ativos"),
    ("GET", "ativarDesativar_itemDemanda_SisStock", "/itens-demandas/ativar_desativar/[^/]+", "Ativar/desativar item de demanda"),
    ("POST", "salvar_itemDemanda_SisStock", "/itens-demandas/salvar", "Salvar item de demanda"),
    ("DELETE", "excluir_itemDemanda_SisStock", "/itens-demandas/excluir/[^/]+", "Excluir item de demanda"),
    ("GET", "buscar_solicitacao_SisStock", "/solicitacoes/buscar/[^/]+", "Buscar solicitacao"),
    ("GET", "imprimir_solicitacao_SisStock", "/solicitacoes/imprimir/[^/]+", "Imprimir solicitacao"),
    ("POST", "salvar_solicitacao_SisStock", "/solicitacoes/salvar", "Salvar solicitacao"),
    ("DELETE", "excluir_solicitacao_SisStock", "/solicitacoes/excluir/[^/]+", "Excluir solicitacao"),
    ("POST", "encerrar_solicitacao_SisStock", "/solicitacoes/encerrar", "Encerrar solicitacao"),
    ("GET", "buscar_itemSolicitacao_SisStock", "/itens-solicitacoes/buscar/[^/]+", "Buscar item de solicitacao"),
    ("GET", "listar_itensSolicitacao_SisStock", "/itens-solicitacoes/listar/[^/]+", "Listar itens de solicitacao"),
    ("POST", "salvar_itemSolicitacao_SisStock", "/itens-solicitacoes/salvar", "Salvar item de solicitacao"),
    ("DELETE", "excluir_itemSolicitacao_SisStock", "/itens-solicitacoes/excluir/[^/]+", "Excluir item de solicitacao"),
    ("GET", "buscar_controleDDU_porRequisicao_SisStock", "/controle-ddu/buscar-por-requisicao/[^/]+", "Buscar DDU por requisicao"),
    ("GET", "listar_itens_controleDDU_SisStock", "/controle-ddu/listar-itens/[^/]+/[^/]+", "Listar itens DDU"),
    ("POST", "atualizar_item_controleDDU_SisStock", "/controle-ddu/atualizar-item", "Atualizar item DDU"),
    ("DELETE", "excluir_item_controleDDU_SisStock", "/controle-ddu/excluir-item", "Excluir item DDU"),
    ("GET", "listar_inventarios_SisStock", "/inventarios/listar/[^/]+/[^/]+/[^/]+", "Listar inventarios"),
    ("GET", "detalhar_inventario_SisStock", "/inventarios/detalhar/[^/]+", "Detalhar inventario"),
    ("GET", "imprimir_inventario_SisStock", "/inventarios/imprimir/[^/]+", "Imprimir inventario"),
    ("POST", "novo_inventario_SisStock", "/inventarios/novo", "Criar novo inventario"),
    ("POST", "adicionar_item_inventario_SisStock", "/inventarios/adicionar-item/[^/]+", "Adicionar item ao inventario"),
    ("DELETE", "excluir_item_inventario_SisStock", "/inventarios/excluir-item/[^/]+/[^/]+", "Excluir item do inventario"),
    ("PATCH", "fechar_inventario_SisStock", "/inventarios/fechar/[^/]+", "Fechar inventario"),
    ("PATCH", "salvar_digitacao_inventario_SisStock", "/inventarios/salvar-digitacao/[^/]+", "Salvar digitacao do inventario"),
]


def main() -> None:
    rows = []
    seen: set[tuple[str, str]] = set()
    for metodo, nome, caminho, desc in already + missing:
        key = (metodo, caminho)
        if key in seen:
            continue
        seen.add(key)
        rows.append((nome, caminho, metodo, APP_ID, desc))

    wb = Workbook()
    ws = wb.active
    ws.title = "Rotas"
    ws.append(["Nome", "Caminho", "Metodo", "Aplicacao (ID)", "Descricao"])
    for row in rows:
        ws.append(list(row))

    out_completo = r"c:\Users\rtjneto\Downloads\routes-farmacia-app12-completo.xlsx"
    out_template = r"c:\Users\rtjneto\Downloads\routes-template (1).xlsx"
    out_faltantes = r"c:\Users\rtjneto\Downloads\routes-farmacia-app12-faltantes.xlsx"

    wb.save(out_completo)
    wb.save(out_template)

    wb_miss = Workbook()
    ws_miss = wb_miss.active
    ws_miss.title = "Rotas"
    ws_miss.append(["Nome", "Caminho", "Metodo", "Aplicacao (ID)", "Descricao"])
    for metodo, nome, caminho, desc in missing:
        ws_miss.append([nome, caminho, metodo, APP_ID, desc])
    wb_miss.save(out_faltantes)

    print(f"Total rotas (completo): {len(rows)}")
    print(f"Ja cadastradas (referencia): {len(already)}")
    print(f"Faltantes: {len(missing)}")
    print(f"Completo: {out_completo}")
    print(f"Template: {out_template}")
    print(f"So faltantes: {out_faltantes}")


if __name__ == "__main__":
    main()
