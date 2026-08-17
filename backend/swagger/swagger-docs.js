import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const backendRoot = path.resolve(__dirname, '..');
const appEntryPath = path.resolve(backendRoot, 'farmacia.ts');
const openApiPath = path.resolve(__dirname, 'openapi.json');
const markdownPath = path.resolve(projectRoot, 'swagger.md');
const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];
const REQUEST_BODY_SCHEMAS = {
  'POST /parametros/boname/salvar': {
    componentName: 'BonameSalvarPayload',
    description: 'Payload para criar ou atualizar um Boname.',
    required: ['bona_codigo', 'bona_descr', 'bona_qt_ui', 'bona_diag_id', 'bona_ativo'],
    properties: {
      bona_id: { type: 'integer', example: 0, description: 'ID do Boname. Use 0 para criar um novo registro.' },
      bona_codigo: { type: 'string', example: 'ABC123', description: 'Codigo do Boname.' },
      bona_descr: { type: 'string', example: 'MEDICAMENTO EXEMPLO', description: 'Descricao do Boname.' },
      bona_qt_ui: { type: 'integer', example: 30, description: 'Quantidade por unidade.' },
      bona_diag_id: { type: 'integer', example: 12, description: 'ID do diagnostico relacionado.' },
      bona_ativo: { type: 'integer', enum: [0, 1], example: 1, description: 'Indicador de status ativo.' },
    },
  },
  'POST /parametros/depositos/salvar': {
    componentName: 'DepositosSalvarPayload',
    description: 'Payload para criar ou atualizar um deposito.',
    required: ['dep_descr', 'dep_ativo'],
    properties: {
      dep_id: { type: 'integer', example: 0, description: 'ID do deposito. Use 0 para criar um novo registro.' },
      dep_descr: { type: 'string', example: 'FARMACIA CENTRAL', description: 'Descricao do deposito.' },
      dep_ativo: { type: 'integer', enum: [0, 1], example: 1, description: 'Indicador de status ativo.' },
    },
  },
  'POST /parametros/diagnosticos/salvar': {
    componentName: 'DiagnosticosSalvarPayload',
    description: 'Payload para criar ou atualizar um diagnostico.',
    required: ['diag_descr', 'diag_ativo'],
    properties: {
      diag_id: { type: 'integer', example: 0, description: 'ID do diagnostico. Use 0 para criar um novo registro.' },
      diag_descr: { type: 'string', example: 'DIAGNOSTICO EXEMPLO', description: 'Descricao do diagnostico.' },
      diag_ativo: { type: 'integer', enum: [0, 1], example: 1, description: 'Indicador de status ativo.' },
    },
  },
  'POST /parametros/locais/salvar': {
    componentName: 'LocaisSalvarPayload',
    description: 'Payload para atualizar um local.',
    required: ['local_id', 'local_descr', 'local_ativo'],
    properties: {
      local_id: { type: 'integer', example: 10, description: 'ID do local.' },
      local_descr: { type: 'string', example: 'AMBULATORIO', description: 'Descricao do local.' },
      local_ativo: { type: 'integer', enum: [0, 1], example: 1, description: 'Indicador de status ativo.' },
    },
  },
  'POST /parametros/medicamentos/salvar': {
    componentName: 'MedicamentosSalvarPayload',
    description: 'Payload para atualizar um medicamento.',
    required: ['med_id', 'med_descr', 'med_descr_coml', 'med_und', 'med_tipo_codigo', 'med_tipo_med', 'med_max', 'med_min', 'med_ui_cx', 'med_alert', 'med_ativo'],
    properties: {
      med_id: { type: 'integer', example: 101, description: 'ID do medicamento.' },
      med_descr: { type: 'string', example: 'MEDICAMENTO EXEMPLO', description: 'Descricao principal do medicamento.' },
      med_descr_coml: { type: 'string', example: 'NOME COMERCIAL', description: 'Descricao comercial.' },
      med_und: { type: 'string', example: 'CX', description: 'Unidade de medida.' },
      med_tipo_codigo: { type: 'string', example: 'ORAL', description: 'Codigo do tipo de medicamento.' },
      med_tipo_med: { type: 'string', example: 'CONTROLADO', description: 'Categoria ou tipo do medicamento.' },
      med_max: { type: 'number', example: 100, description: 'Estoque maximo sugerido.' },
      med_min: { type: 'number', example: 10, description: 'Estoque minimo sugerido.' },
      med_ui_cx: { type: 'number', example: 20, description: 'Unidades internas por caixa.' },
      med_bona_codigo: { type: ['string', 'null'], example: 'ABC123', description: 'Codigo Boname relacionado. Envie null quando nao houver vinculo.' },
      med_alert: { type: 'integer', example: 1, description: 'Indicador de alerta do medicamento.' },
      med_diag_id: { type: ['integer', 'null'], example: 12, description: 'ID do diagnostico relacionado. Envie null quando nao houver vinculo.' },
      med_ativo: { type: 'integer', enum: [0, 1], example: 1, description: 'Indicador de status ativo.' },
    },
  },
  'POST /parametros/tipos_produtos/salvar': {
    componentName: 'TiposProdutosSalvarPayload',
    description: 'Payload para atualizar um tipo de produto.',
    required: ['tipo_id', 'tipo_codigo', 'tipo_descr', 'tipo_ativo'],
    properties: {
      tipo_id: { type: 'integer', example: 1, description: 'ID do tipo de produto.' },
      tipo_codigo: { type: 'string', example: 'ORAL', description: 'Codigo do tipo de produto.' },
      tipo_descr: { type: 'string', example: 'MEDICAMENTO ORAL', description: 'Descricao do tipo de produto.' },
      tipo_ativo: { type: 'integer', enum: [0, 1], example: 1, description: 'Indicador de status ativo.' },
    },
  },
  'POST /entradas/salvar': {
    componentName: 'EntradasSalvarPayload',
    description: 'Payload para salvar uma entrada de estoque com cabeçalho e itens.',
    required: ['ent_date', 'ent_for_id', 'ent_dep_id', 'itens'],
    properties: {
      ent_id: { type: 'integer', example: 0, description: 'ID da entrada. Use 0 para criar uma nova entrada.' },
      ent_date: { type: 'string', format: 'date', example: '2026-06-06', description: 'Data do cabeçalho da entrada.' },
      ent_doc: { type: 'string', example: '202606123456', description: 'Documento fiscal ou referencia da entrada. Se vier nulo, indefinido ou zero, o backend gera automaticamente um numero no formato AAAAMM+sequencia.' },
      ent_for_id: { type: 'integer', example: 15, description: 'ID do fornecedor selecionado.' },
      ent_dep_id: { type: 'integer', example: 2, description: 'Depósito usado para refletir a movimentação no estoque.' },
      itens: {
        type: 'array',
        description: 'Itens da entrada persistidos em tb_itens_entradas.',
        items: {
          type: 'object',
          required: ['ent_med_id', 'ent_lote', 'ent_lote_validade', 'ent_qtde'],
          properties: {
            ent_med_id: { type: 'integer', example: 101, description: 'ID do medicamento do item.' },
            ent_lote: { type: 'string', example: 'LOTE-001', description: 'Lote do item.' },
            ent_lote_validade: { type: 'string', format: 'date', example: '2027-01-31', description: 'Validade do lote do item.' },
            ent_qtde: { type: 'number', example: 150, description: 'Quantidade recebida do item.' },
          },
        },
      },
    },
  },
  'PUT /entradas/itens/{ite_id}': {
    componentName: 'EntradasAtualizarItemPayload',
    description: 'Payload para atualizar lote, validade e quantidade de um item vinculado a uma entrada pendente.',
    required: ['ent_lote', 'ent_lote_validade', 'ent_qtde'],
    properties: {
      ent_lote: { type: 'string', example: 'LOTE-001', description: 'Novo lote do item.' },
      ent_lote_validade: { type: 'string', format: 'date', example: '2027-01-31', description: 'Nova validade do lote.' },
      ent_qtde: { type: 'number', example: 150, description: 'Nova quantidade do item.' },
    },
  },
  'POST /requisicoes/salvar': {
    componentName: 'RequisicoesSalvarPayload',
    description: 'Payload para salvar uma requisicao de medicamento.',
    required: ['req_id', 'req_data', 'req_med_id', 'req_pac_id', 'req_qtde', 'req_lote', 'req_val_mes', 'req_val_ano', 'req_dep_id', 'req_local_id', 'req_tipo'],
    properties: {
      req_id: { type: 'integer', example: 1001, description: 'ID da requisicao.' },
      req_data: { type: 'string', format: 'date-time', example: '2026-06-03T10:00:00.000Z', description: 'Data da requisicao.' },
      req_med_id: { type: 'integer', example: 101, description: 'ID do medicamento.' },
      req_pac_id: { type: 'integer', example: 5001, description: 'ID do paciente.' },
      req_qtde: { type: 'number', example: 2, description: 'Quantidade requisitada.' },
      req_lote: { type: 'string', example: 'LOTE-001', description: 'Lote do item requisitado.' },
      req_val_mes: { type: 'integer', example: 12, description: 'Mes de validade do lote.' },
      req_val_ano: { type: 'integer', example: 2027, description: 'Ano de validade do lote.' },
      req_dep_id: { type: 'integer', example: 2, description: 'ID do deposito.' },
      req_local_id: { type: 'integer', example: 10, description: 'ID do local solicitante.' },
      req_tipo: { type: 'string', example: 'NORMAL', description: 'Tipo da requisicao.' },
    },
  },
  'POST /requisicoes/salvar_devolucao': {
    componentName: 'RequisicoesSalvarDevolucaoPayload',
    description: 'Payload para salvar uma requisicao de devolucao total de medicamento.',
    required: ['req_id', 'data', 'solicitado_por', 'req_num_dispesa', 'itens'],
    properties: {
      req_id: { type: 'integer', example: 0, description: 'ID da devolucao. Use 0 para criar uma nova requisicao de devolucao.' },
      data: { type: 'string', format: 'date-time', example: '2026-08-04T00:00:00', description: 'Data da devolucao.' },
      solicitado_por: { type: 'string', example: 'OVIDIO', description: 'Usuario solicitante da devolucao.' },
      observacao: { type: ['string', 'null'], example: 'DEVOLUCAO TOTAL', description: 'Observacao da devolucao.' },
      req_num_dispesa: { type: 'string', example: 'REQ0001', description: 'Numero da requisicao de dispensacao original.' },
      req_num_dispensacao: { type: 'string', example: 'REQ0001', description: 'Alias aceito para o numero da requisicao de dispensacao original.' },
      itens: {
        type: 'array',
        description: 'Itens devolvidos integralmente.',
        items: {
          type: 'object',
          required: ['med_id', 'lote', 'qtde', 'validade'],
          properties: {
            med_id: { type: 'integer', example: 101, description: 'ID do medicamento.' },
            lote: { type: 'string', example: 'LOTE-001', description: 'Lote do item.' },
            qtde: { type: 'number', example: 2, description: 'Quantidade devolvida.' },
            validade: { type: 'string', format: 'date-time', example: '2027-01-31T00:00:00', description: 'Validade do lote.' },
          },
        },
      },
    },
  },
  'POST /requisicoes/aprovar/{req_id}': {
    componentName: 'RequisicoesAprovarPayload',
    description: 'Payload para aprovar uma requisicao pendente e processar baixa de estoque.',
    required: ['user'],
    properties: {
      user: { type: 'string', example: 'OVIDIO', description: 'Usuario responsavel pela aprovacao.' },
    },
  },
  'POST /auth/simular': {
    componentName: 'AuthSimularPayload',
    description: 'Payload para simular a criação de uma sessão autenticada. Não requer parâmetros adicionais.',
    required: [],
    properties: {},
  },
  'POST /controle-ddu/atualizar-item': {
    componentName: 'ControleDDUAtualizarItemPayload',
    description: 'Payload para atualizar a quantidade de retorno de itens de uma requisição DDU.',
    required: ['req_num', 'itens'],
    properties: {
      req_num: { type: 'string', example: 'REQ0001', description: 'Número da requisição.' },
      itens: {
        type: 'array',
        description: 'Lista de itens para registrar a quantidade de retorno.',
        items: {
          type: 'object',
          required: ['med_id', 'lote', 'qtde_retorno'],
          properties: {
            med_id: { type: 'string', example: '101', description: 'ID do medicamento.' },
            lote: { type: 'string', example: 'LOTE-001', description: 'Lote do item.' },
            qtde_retorno: { type: 'integer', example: 10, description: 'Quantidade retornada.' },
          },
        },
      },
    },
  },
  'POST /demandas-especificas/salvar': {
    componentName: 'DemandasEspecificasSalvarPayload',
    description: 'Payload para criar ou atualizar uma demanda específica.',
    required: ['dem_pac_id', 'dem_medico_assis', 'dem_medico_crm', 'dem_diag_id'],
    properties: {
      id: { type: 'integer', example: 0, description: 'ID da demanda específica. Use 0 para criar uma nova.' },
      dem_pac_id: { type: 'integer', example: 1, description: 'ID do paciente associado.' },
      dem_medico_assis: { type: 'string', example: 'DR. JOAO SILVA', description: 'Nome do médico assistente.' },
      dem_medico_crm: { type: 'string', example: '123456-SP', description: 'CRM do médico assistente.' },
      dem_responsavel: { type: 'string', example: 'MARIA SOUZA', description: 'Nome do responsável pela demanda.' },
      dem_diag_id: { type: 'integer', example: 5, description: 'ID do diagnóstico relacionado.' },
    },
  },
  'POST /demandas-especificas/salvar_entradas_demandas': {
    componentName: 'DemandasEspecificasSalvarEntradasPayload',
    description: 'Payload para registrar entradas de estoque originadas de demandas específicas.',
    required: ['ent_pac_id', 'ent_for_id', 'ent_dep_id', 'ent_user_digit', 'itens'],
    properties: {
      ent_id: { type: 'integer', example: 0, description: 'ID da entrada. Use 0 para criar.' },
      ent_doc: { type: 'string', example: 'DOC-12345', description: 'Documento/Nota fiscal associado à entrada.' },
      ent_pac_id: { type: 'integer', example: 1, description: 'ID do paciente.' },
      ent_for_id: { type: 'integer', example: 10, description: 'ID do fornecedor.' },
      ent_dep_id: { type: 'integer', example: 2, description: 'ID do depósito de destino no estoque.' },
      ent_user_digit: { type: 'string', example: 'OVIDIO', description: 'Usuário digitador responsável.' },
      itens: {
        type: 'array',
        description: 'Lista de medicamentos contidos na entrada de demanda.',
        items: {
          type: 'object',
          required: ['ent_med_id', 'ent_lote', 'ent_lote_validade', 'ent_qtde'],
          properties: {
            ent_med_id: { type: 'integer', example: 101, description: 'ID do medicamento.' },
            ent_lote: { type: 'string', example: 'LOTE-001', description: 'Código do lote do medicamento.' },
            ent_lote_validade: { type: 'string', format: 'date', example: '2027-01-31', description: 'Validade do lote.' },
            ent_qtde: { type: 'number', example: 50, description: 'Quantidade do medicamento.' },
          },
        },
      },
    },
  },
  'POST /entradas/aprovar-entradas': {
    componentName: 'EntradasAprovarEntradasPayload',
    description: 'Payload para aprovar uma entrada e efetivar a entrada física do medicamento no estoque.',
    required: ['ent_id', 'user_aprov'],
    properties: {
      ent_id: { type: 'integer', example: 15, description: 'ID da entrada a ser aprovada.' },
      user_aprov: { type: 'string', example: 'OVIDIO', description: 'Usuário aprovador.' },
    },
  },
  'POST /estoque/salvar': {
    componentName: 'EstoqueSalvarPayload',
    description: 'Payload para salvar ou atualizar um registro direto de estoque físico.',
    required: ['est_dep_id', 'est_med_id', 'est_lote', 'est_saldo', 'est_validade'],
    properties: {
      est_id: { type: 'integer', example: 0, description: 'ID do item de estoque. Use 0 para criar.' },
      est_dep_id: { type: 'integer', example: 2, description: 'ID do depósito.' },
      est_med_id: { type: 'integer', example: 101, description: 'ID do medicamento.' },
      est_lote: { type: 'string', example: 'LOTE-001', description: 'Lote físico.' },
      est_saldo: { type: 'number', example: 100, description: 'Saldo disponível em estoque.' },
      est_validade: { type: 'string', format: 'date', example: '2027-12-31', description: 'Data de validade do lote.' },
    },
  },
  'POST /estoque/transferir': {
    componentName: 'EstoqueTransferirPayload',
    description: 'Payload para transferência de medicamentos de um depósito para outro.',
    required: ['est_dep_id_origem', 'est_dep_id_destino', 'user', 'list_itens'],
    properties: {
      est_dep_id_origem: { type: 'integer', example: 2, description: 'ID do depósito de origem.' },
      est_dep_id_destino: { type: 'integer', example: 3, description: 'ID do depósito de destino.' },
      user: { type: 'string', example: 'OVIDIO', description: 'Usuário executor da transferência.' },
      list_itens: {
        type: 'array',
        description: 'Lista de medicamentos a serem transferidos.',
        items: {
          type: 'object',
          required: ['med_id', 'lote', 'quantidade'],
          properties: {
            med_id: { type: 'integer', example: 101, description: 'ID do medicamento.' },
            lote: { type: 'string', example: 'LOTE-001', description: 'Lote a transferir.' },
            quantidade: { type: 'number', example: 10, description: 'Quantidade a transferir.' },
          },
        },
      },
    },
  },
  'POST /parametros/fornecedores/salvar': {
    componentName: 'FornecedoresSalvarPayload',
    description: 'Payload para criar ou atualizar as informações de um fornecedor.',
    required: ['for_razao_social', 'for_nome_fantasia', 'for_telefone', 'for_ativo'],
    properties: {
      for_id: { type: 'integer', example: 0, description: 'ID do fornecedor. Use 0 para criar.' },
      for_razao_social: { type: 'string', example: 'DISTRIBUIDORA DE MEDICAMENTOS LTDA', description: 'Razão social.' },
      for_nome_fantasia: { type: 'string', example: 'MED DISTR', description: 'Nome fantasia.' },
      for_cnpj: { type: 'string', example: '12345678000199', description: 'CNPJ do fornecedor (somente números, max 14).' },
      for_logradouro: { type: 'string', example: 'AVENIDA CENTRAL', description: 'Logradouro.' },
      for_numero: { type: 'string', example: '100', description: 'Número do endereço.' },
      for_bairro: { type: 'string', example: 'CENTRO', description: 'Bairro.' },
      for_cidade: { type: 'string', example: 'SAO PAULO', description: 'Cidade.' },
      for_uf: { type: 'string', example: 'SP', description: 'Estado/UF (2 letras).' },
      for_telefone: { type: 'string', example: '11999999999', description: 'Telefone.' },
      for_email: { type: 'string', example: 'contato@fornecedor.com', description: 'E-mail.' },
      for_ativo: { type: 'integer', enum: [0, 1], example: 1, description: 'Indicador de status ativo.' },
    },
  },
  'POST /itens-demandas/salvar': {
    componentName: 'ItensDemandasSalvarPayload',
    description: 'Payload para adicionar ou atualizar itens a uma demanda específica.',
    required: ['dem_id', 'dem_med_id', 'dem_med_qtde'],
    properties: {
      id: { type: 'integer', example: 0, description: 'ID do item de demanda. Use 0 para criar.' },
      dem_id: { type: 'integer', example: 10, description: 'ID da demanda associada.' },
      dem_med_id: { type: 'integer', example: 101, description: 'ID do medicamento.' },
      dem_med_qtde: { type: 'number', example: 30, description: 'Quantidade requisitada do medicamento.' },
      dem_med_ativo: { type: 'integer', enum: [0, 1], example: 1, description: 'Indicador de item ativo.' },
    },
  },
  'POST /itens-solicitacoes/salvar': {
    componentName: 'ItensSolicitacoesSalvarPayload',
    description: 'Payload para salvar ou atualizar um item pertencente a uma solicitação.',
    required: ['iso_sol_id', 'iso_med_id', 'iso_med_qtde'],
    properties: {
      iso_id: { type: 'integer', example: 0, description: 'ID do item. Use 0 para criar.' },
      iso_sol_id: { type: 'integer', example: 5, description: 'ID da solicitação associada.' },
      iso_med_id: { type: 'integer', example: 101, description: 'ID do medicamento.' },
      iso_med_qtde: { type: 'number', example: 10, description: 'Quantidade solicitada.' },
      iso_med_lote: { type: 'string', example: 'LOTE-001', description: 'Lote do medicamento (opcional).' },
      iso_med_validade: { type: 'string', format: 'date', example: '2027-12-31', description: 'Validade do lote (opcional).' },
    },
  },
  'PUT /requisicoes/itens/{ite_id}': {
    componentName: 'RequisicoesItensAtualizarPayload',
    description: 'Payload para atualizar a quantidade de um item de uma requisição de medicamento.',
    required: ['ite_qtde'],
    properties: {
      ite_qtde: { type: 'number', example: 5, description: 'Nova quantidade do item da requisição.' },
    },
  },
  'POST /requisicoes/reprovar': {
    componentName: 'RequisicoesReprovarPayload',
    description: 'Payload para registrar a reprovação de uma requisição.',
    required: ['req_id', 'user', 'justificativa'],
    properties: {
      req_id: { type: 'integer', example: 1001, description: 'ID da requisição a ser reprovada.' },
      user: { type: 'string', example: 'OVIDIO', description: 'Usuário logado responsável.' },
      justificativa: { type: 'string', example: 'RECEITA DUPLICADA', description: 'Motivo da reprovação.' },
    },
  },
  'POST /parametros/setores/salvar': {
    componentName: 'SetoresSalvarPayload',
    description: 'Payload para salvar ou atualizar um setor.',
    required: ['setor_descr', 'setor_ativo'],
    properties: {
      id_setor: { type: 'integer', example: 0, description: 'ID do setor. Use 0 para criar.' },
      setor_descr: { type: 'string', example: 'PEDIATRIA', description: 'Nome/descrição do setor.' },
      setor_ativo: { type: 'integer', enum: [0, 1], example: 1, description: 'Indicador de status ativo.' },
    },
  },
  'POST /solicitacoes/encerrar': {
    componentName: 'SolicitacoesEncerrarPayload',
    description: 'Payload para encerrar uma solicitação baixando itens no estoque.',
    required: ['sol_id', 'user_aprov', 'itens'],
    properties: {
      sol_id: { type: 'integer', example: 5, description: 'ID da solicitação.' },
      user_aprov: { type: 'string', example: 'OVIDIO', description: 'Usuário aprovador.' },
      itens: {
        type: 'array',
        description: 'Lista de itens a serem digitados e baixados.',
        items: {
          type: 'object',
          required: ['iso_id', 'iso_med_id', 'qtde_digitada', 'iso_med_lote'],
          properties: {
            iso_id: { type: 'integer', example: 12, description: 'ID do item da solicitação.' },
            iso_med_id: { type: 'integer', example: 101, description: 'ID do medicamento.' },
            qtde_digitada: { type: 'number', example: 10, description: 'Quantidade real entregue.' },
            iso_med_qtde: { type: 'number', example: 10, description: 'Quantidade originalmente solicitada.' },
            iso_med_lote: { type: 'string', example: 'LOTE-001', description: 'Lote entregue.' },
            iso_med_validade: { type: 'string', format: 'date', example: '2027-12-31', description: 'Validade do lote entregue.' },
          },
        },
      },
    },
  },
  'POST /solicitacoes/salvar': {
    componentName: 'SolicitacoesSalvarPayload',
    description: 'Payload para criar ou atualizar uma solicitação.',
    required: ['sol_id', 'sol_date', 'sol_dep_ori_id', 'sol_dep_des_id', 'sol_user_create'],
    properties: {
      sol_id: { type: 'integer', example: 0, description: 'ID da solicitação. Use 0 para criar.' },
      sol_date: { type: 'string', format: 'date-time', example: '2026-06-03T10:00:00.000Z', description: 'Data da solicitação.' },
      sol_dep_ori_id: { type: 'integer', example: 2, description: 'ID do depósito de origem.' },
      sol_dep_des_id: { type: 'integer', example: 3, description: 'ID do depósito de destino.' },
      sol_user_create: { type: 'string', example: 'OVIDIO', description: 'Usuário criador.' },
      sol_status: { type: 'integer', example: 0, description: 'Status (0: Aberta, 1: Encerrada).' },
      sol_obs: { type: 'string', example: 'OBSERVAÇÃO DA SOLICITAÇÃO', description: 'Observações.' },
      itens: {
        type: 'array',
        description: 'Lista opcional de itens incluídos na criação.',
        items: {
          type: 'object',
          required: ['iso_med_id', 'iso_med_qtde'],
          properties: {
            iso_id: { type: 'integer', example: 0, description: 'ID do item. Use 0 para criar.' },
            iso_med_id: { type: 'integer', example: 101, description: 'ID do medicamento.' },
            iso_med_qtde: { type: 'number', example: 10, description: 'Quantidade solicitada.' },
            iso_med_lote: { type: 'string', example: 'LOTE-001', description: 'Lote (opcional).' },
            iso_med_validade: { type: 'string', format: 'date', example: '2027-12-31', description: 'Validade (opcional).' },
          },
        },
      },
    },
  },
  'POST /parametros/tipos_medicamentos/salvar': {
    componentName: 'TiposMedicamentosSalvarPayload',
    description: 'Payload para criar ou atualizar um tipo de medicamento.',
    required: ['tipo_codigo', 'tipo_descr', 'tipo_ativo'],
    properties: {
      tipo_id: { type: 'integer', example: 0, description: 'ID do tipo. Use 0 para criar.' },
      tipo_codigo: { type: 'string', example: 'ORAL', description: 'Código do tipo de medicamento.' },
      tipo_descr: { type: 'string', example: 'MEDICAMENTO ORAL', description: 'Descrição.' },
      tipo_ativo: { type: 'integer', enum: [0, 1], example: 1, description: 'Indicador de status ativo.' },
    },
  },
  'POST /parametros/tipos_requisicoes/salvar': {
    componentName: 'TiposRequisicoesSalvarPayload',
    description: 'Payload para criar ou atualizar um tipo de requisição.',
    required: ['cod_tipo', 'tipo_req_descr'],
    properties: {
      id_tipo: { type: 'integer', example: 0, description: 'ID do tipo de requisição. Use 0 para criar.' },
      cod_tipo: { type: 'string', example: 'URGENTE', description: 'Código do tipo.' },
      tipo_req_descr: { type: 'string', example: 'REQUISICAO URGENTE', description: 'Descrição do tipo de requisição.' },
    },
  },
};

function normalizeExpressPath(routePath) {
  return routePath.replace(/:([A-Za-z0-9_]+)/g, '{$1}').replace(/\/+$/g, '') || '/';
}

function extractPathParams(routePath) {
  const params = new Set();
  const regex = /:([A-Za-z0-9_]+)/g;
  let match = regex.exec(routePath);

  while (match) {
    params.add(match[1]);
    match = regex.exec(routePath);
  }

  return [...params].map((name) => ({
    name,
    in: 'path',
    required: true,
    schema: { type: 'string' },
    description: `Parametro de rota ${name}.`,
  }));
}

function inferTag(fullPath) {
  const [, firstSegment, secondSegment] = fullPath.split('/');

  if (firstSegment === 'parametros' && secondSegment) {
    return secondSegment.replace(/_/g, ' ');
  }

  return (firstSegment || 'outros').replace(/_/g, ' ');
}

function toTitleCase(value) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function inferSummary(method, fullPath) {
  const label = fullPath
    .replace(/\{[^}]+\}/g, '')
    .split('/')
    .filter(Boolean)
    .join(' ')
    .replace(/_/g, ' ')
    .trim();

  return `${method.toUpperCase()} ${label || 'raiz'}`;
}

function buildOperation({ method, routePath, fullPath }) {
  const requestBodySchema = REQUEST_BODY_SCHEMAS[`${method.toUpperCase()} ${fullPath}`];
  const isPdfInlineRoute = method === 'get' && [
    '/demandas-especificas/imprimir-recibo/{ent_id}',
    '/inventarios/imprimir/{inv_num}',
    '/requisicoes/imprimir/{req_id}',
    '/solicitacoes/imprimir/{sol_id}',
  ].includes(fullPath);
  const operation = {
    tags: [toTitleCase(inferTag(fullPath))],
    summary: inferSummary(method, fullPath),
    parameters: [
      ...extractPathParams(routePath),
      {
        name: 'Authorization',
        in: 'header',
        required: false,
        schema: { type: 'string' },
        description: 'Bearer token. Necessario quando a autenticacao estiver habilitada no ambiente.',
      },
    ],
    responses: {
      '200': {
        description: 'Sucesso',
        content: {
          ...(isPdfInlineRoute
            ? {
                'application/pdf': {
                  schema: {
                    type: 'string',
                    format: 'binary',
                  },
                },
              }
            : {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiResponse' },
                },
              }),
        },
      },
      '400': {
        description: 'Requisicao invalida',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      '401': {
        description: 'Nao autenticado',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      '404': {
        description: 'Recurso nao encontrado',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      '500': {
        description: 'Erro interno',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
  };

  if (fullPath === '/requisicoes/aprovar/{req_id}') {
    operation.responses['409'] = {
      description: 'Conflito de regra de negocio',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    };
  }

  if (['post', 'put', 'patch'].includes(method)) {
    operation.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: requestBodySchema
            ? { $ref: `#/components/schemas/${requestBodySchema.componentName}` }
            : {
                type: 'object',
                additionalProperties: true,
              },
          },
        },
      };
  }

  return operation;
}

function parseRoutesFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const endpoints = [];
  const regex = /router\.(get|post|put|patch|delete)\(\s*['"]([^'"]+)['"]/g;

  let match = regex.exec(content);
  while (match) {
    endpoints.push({
      method: match[1].toLowerCase(),
      routePath: match[2],
    });
    match = regex.exec(content);
  }

  return endpoints;
}

function parseRouteMounts() {
  const content = fs.readFileSync(appEntryPath, 'utf8');
  const importRegex = /import\s+([A-Za-z0-9_]+)\s+from\s+['"](\.\/routes\/[^'"]+)['"];?/g;
  const mountRegex = /app\.use\(\s*['"]([^'"]+)['"]\s*,\s*([A-Za-z0-9_]+)\s*\);/g;
  const importMap = new Map();
  const mounts = [];

  let importMatch = importRegex.exec(content);
  while (importMatch) {
    const variableName = importMatch[1];
    const relativeImportPath = importMatch[2].replace(/\.js$/, '.ts');
    importMap.set(variableName, path.resolve(backendRoot, relativeImportPath));
    importMatch = importRegex.exec(content);
  }

  let mountMatch = mountRegex.exec(content);
  while (mountMatch) {
    const mountPath = mountMatch[1];
    const variableName = mountMatch[2];
    const routeFilePath = importMap.get(variableName);

    if (routeFilePath && fs.existsSync(routeFilePath)) {
      mounts.push({
        mountPath,
        routeFilePath,
      });
    }

    mountMatch = mountRegex.exec(content);
  }

  return mounts;
}

function buildOpenApiSpec() {
  const mounts = parseRouteMounts();
  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'Farmacia Ambulatorial API',
      version: '1.0.0',
      description: 'Especificacao gerada automaticamente a partir das rotas Express do projeto farmacia.',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Ambiente local' },
    ],
    paths: {},
    components: {
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            err: { type: 'integer', example: 0 },
            msg: { type: 'string', example: 'OK' },
            status: { type: 'integer', example: 200 },
            data: {
              oneOf: [
                { type: 'array', items: { type: 'object', additionalProperties: true } },
                { type: 'object', additionalProperties: true },
                { type: 'null' },
              ],
            },
          },
          required: ['err', 'msg', 'status', 'data'],
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            err: { type: 'integer', example: 500 },
            msg: { type: 'string', example: 'Erro interno do servidor.' },
            status: { type: 'integer', example: 500 },
            data: {
              oneOf: [
                { type: 'array', items: { type: 'object', additionalProperties: true } },
                { type: 'object', additionalProperties: true },
                { type: 'null' },
              ],
            },
          },
          required: ['err', 'msg', 'status', 'data'],
        },
        ...Object.fromEntries(
          Object.values(REQUEST_BODY_SCHEMAS).map((schema) => [
            schema.componentName,
            {
              type: 'object',
              description: schema.description,
              properties: schema.properties,
              required: schema.required,
            },
          ]),
        ),
      },
    },
  };

  for (const mount of mounts) {
    const endpoints = parseRoutesFile(mount.routeFilePath);

    for (const endpoint of endpoints) {
      if (!HTTP_METHODS.includes(endpoint.method)) {
        continue;
      }

      const fullPath = normalizeExpressPath(`${mount.mountPath}${endpoint.routePath}`);
      if (!spec.paths[fullPath]) {
        spec.paths[fullPath] = {};
      }

      spec.paths[fullPath][endpoint.method] = buildOperation({
        method: endpoint.method,
        routePath: endpoint.routePath,
        fullPath,
      });
    }
  }

  return spec;
}

function renderParameterTable(parameters) {
  if (!parameters.length) {
    return '- Nenhum parametro documentado.\n';
  }

  const header = [
    '| Nome | Local | Obrigatorio | Tipo | Descricao |',
    '| --- | --- | --- | --- | --- |',
  ];

  const rows = parameters.map((parameter) => {
    const schemaType = parameter.schema?.type || 'object';
    return `| ${parameter.name} | ${parameter.in} | ${parameter.required ? 'sim' : 'nao'} | ${schemaType} | ${parameter.description || ''} |`;
  });

  return `${header.concat(rows).join('\n')}\n`;
}

function renderResponses(responses) {
  const header = [
    '| Status | Descricao |',
    '| --- | --- |',
  ];

  const rows = Object.entries(responses).map(([status, config]) => `| ${status} | ${config.description} |`);
  return `${header.concat(rows).join('\n')}\n`;
}

function resolveSchemaFromRef(spec, schemaRef) {
  const schemaName = String(schemaRef || '').replace('#/components/schemas/', '');
  return spec.components?.schemas?.[schemaName] || null;
}

function renderSchemaTable(schema) {
  if (!schema?.properties) {
    return '- Schema nao detalhado.\n';
  }

  const required = new Set(schema.required || []);
  const header = [
    '| Campo | Tipo | Obrigatorio | Descricao |',
    '| --- | --- | --- | --- |',
  ];

  const rows = Object.entries(schema.properties).map(([fieldName, config]) => {
    const type = config.type || (config.enum ? 'enum' : 'object');
    const suffix = config.enum ? ` (${config.enum.join(', ')})` : '';
    return `| ${fieldName} | ${type}${suffix} | ${required.has(fieldName) ? 'sim' : 'nao'} | ${config.description || ''} |`;
  });

  return `${header.concat(rows).join('\n')}\n`;
}

function renderSchemaBulletList(schema) {
  if (!schema?.properties) {
    return '- Schema nao detalhado.\n';
  }

  const required = new Set(schema.required || []);

  return `${Object.entries(schema.properties)
    .map(([fieldName, config]) => {
      const type = config.type || (config.enum ? 'enum' : 'object');
      const enumSuffix = config.enum ? ` (${config.enum.join(', ')})` : '';
      const requiredLabel = required.has(fieldName) ? 'obrigatorio' : 'opcional';
      return `- \`${fieldName}\`: ${type}${enumSuffix}, ${requiredLabel}. ${config.description || ''}`.trim();
    })
    .join('\n')}\n`;
}

function renderMarkdown(spec) {
  const lines = [
    '# Swagger - Farmacia Ambulatorial',
    '',
    'Documentacao gerada automaticamente a partir das rotas Express do backend.',
    '',
    `- Gerado em: ${new Date().toISOString()}`,
    `- OpenAPI: ${spec.openapi}`,
    '',
    '## Visao Geral',
    '',
    `- Titulo: ${spec.info.title}`,
    `- Versao: ${spec.info.version}`,
    `- Base URL local: ${spec.servers[0]?.url || 'http://localhost:3000'}`,
    '- Autenticacao: header `Authorization: Bearer <token>` quando a autenticacao estiver habilitada.',
    '',
    '## Endpoints',
    '',
  ];

  const groupedPaths = new Map();

  for (const [apiPath, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      const tag = operation.tags?.[0] || 'Outros';
      if (!groupedPaths.has(tag)) {
        groupedPaths.set(tag, []);
      }

      groupedPaths.get(tag).push({ apiPath, method, operation });
    }
  }

  for (const [tag, endpoints] of [...groupedPaths.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`### ${tag}`);
    lines.push('');

    for (const endpoint of endpoints.sort((a, b) => a.apiPath.localeCompare(b.apiPath) || a.method.localeCompare(b.method))) {
      lines.push(`#### ${endpoint.method.toUpperCase()} ${endpoint.apiPath}`);
      lines.push('');
      lines.push(`- Resumo: ${endpoint.operation.summary}`);
      lines.push(`- Request body: ${endpoint.operation.requestBody ? 'sim' : 'nao'}`);
      lines.push('');
      if (endpoint.operation.requestBody) {
        const requestSchema = resolveSchemaFromRef(
          spec,
          endpoint.operation.requestBody.content?.['application/json']?.schema?.$ref,
        );
        lines.push('##### Payload');
        lines.push('');
        lines.push(renderSchemaBulletList(requestSchema).trimEnd());
        lines.push('');
      }
      lines.push('##### Parametros');
      lines.push('');
      lines.push(renderParameterTable(endpoint.operation.parameters || []).trimEnd());
      lines.push('');
      lines.push('##### Respostas');
      lines.push('');
      lines.push(renderResponses(endpoint.operation.responses || {}).trimEnd());
      lines.push('');
    }
  }

  lines.push('## Schemas');
  lines.push('');
  lines.push('### ApiResponse');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(spec.components.schemas.ApiResponse, null, 2));
  lines.push('```');
  lines.push('');
  lines.push('### ErrorResponse');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(spec.components.schemas.ErrorResponse, null, 2));
  lines.push('```');
  lines.push('');

  return `${lines.join('\n')}\n`;
}

export function generateOpenApiSpec() {
  return buildOpenApiSpec();
}

export function generateAndSaveSwaggerDocs() {
  const spec = buildOpenApiSpec();
  const markdown = renderMarkdown(spec);

  fs.writeFileSync(openApiPath, `${JSON.stringify(spec, null, 2)}\n`, 'utf8');
  fs.writeFileSync(markdownPath, markdown, 'utf8');

  return { spec, markdownPath, openApiPath };
}

generateAndSaveSwaggerDocs();
