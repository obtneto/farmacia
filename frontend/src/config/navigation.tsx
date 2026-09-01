import type { ReactElement } from 'react'
import type { IconProps } from '@rsuite/icons/Icon'
import {
  RiAddLine,
  RiArchiveDrawerLine,
  RiBookletLine,
  RiBuilding2Line,
  RiCapsuleLine,
  RiClipboardLine,
  RiDashboardLine,
  RiDatabase2Line,
  RiFileList3Line,
  RiFileHistoryLine,
  RiFileSearchLine,
  RiFileSettingsLine,
  RiFileTransferLine,
  RiFolderOpenLine,
  RiHistoryLine,
  RiHomeHeartLine,
  RiInboxArchiveLine,
  RiListCheck3,
  RiNodeTree,
  RiMapPinLine,
  RiPriceTag3Line,
  RiRefund2Line,
  RiRouteLine,
  RiShapesLine,
  RiSettings3Line,
  RiStethoscopeLine,
  RiTeamLine,
  RiSwapBoxLine,
  RiToolsLine,
  RiTruckLine,
  RiUserLine,
  RiVerifiedBadgeLine,
} from 'react-icons/ri'

export type SectionKey =
  | 'inicio'
  | 'pacientes'
  | 'pacientes/ambulatorio'
  | 'pacientes/demandas_especificas'
  | 'estoque'
  | 'estoque/listar'
  | 'estoque/transferencia_depositos/nova_solicitacao'
  | 'estoque/transferencia_depositos/solicitacoes_abertas'
  | 'estoque/transferencia_depositos/solicitacoes_encerradas'
  | 'estoque/consultar_movimentacoes'
  | 'requisicoes/aprovacao'
  | 'requisicoes/por_paciente'
  | 'requisicoes/por_setor'
  | 'requisicoes/listar_por_periodo'
  | 'requisicoes/devolucao_medicamento'
  | 'requisicoes/controle_dose_domiciliar'
  | 'operacao/entradas/nova'
  | 'operacao/entradas/listar'
  | 'operacao/entradas/demandas'
  | 'operacao/entradas/aprovacao'
  | 'operacao/inventarios/listar'
  | 'operacao/inventarios/novo'
  | 'parametros/boname'
  | 'parametros/depositos'
  | 'parametros/fornecedores'
  | 'parametros/medicamentos'
  | 'parametros/diagnosticos'
  | 'parametros/locais'
  | 'parametros/tipos_medicamentos'
  | 'parametros/setores'
  | 'parametros/tipos_requisicoes'

export type SectionMeta = {
  breadcrumbItems: string[]
  description?: string
  status: string
  title: string
}

export type NavigationLeafItem = {
  badge?: string
  eventKey: SectionKey
  icon: ReactElement<IconProps>
  label: string
}

export type NavigationSubmenuItem = {
  badge?: string
  children: NavigationItem[]
  icon: ReactElement<IconProps>
  label: string
}

export type NavigationItem = NavigationLeafItem | NavigationSubmenuItem

export type NavigationGroup = {
  icon?: ReactElement<IconProps>
  items: NavigationItem[]
  title: string
}

export const APP_SECTIONS: Record<SectionKey, SectionMeta> = {
  inicio: {
    breadcrumbItems: ['Inicio', 'Workspace', 'Dashboard'],
    description: 'Painel operacional com atalhos, indicadores e padroes visuais para os modulos do sistema.',
    status: 'Workspace ativo',
    title: 'Dashboard corporativo',
  },
  pacientes: {
    breadcrumbItems: ['Inicio', 'Operacao', 'Pacientes'],
    description: 'Espaco reservado para fluxos de atendimento, historico e acompanhamento ambulatorial.',
    status: 'Modulo planejado',
    title: 'Pacientes',
  },
  'pacientes/ambulatorio': {
    breadcrumbItems: ['Inicio', 'Operacao', 'Pacientes', 'Ambulatorio'],
    status: 'Consulta ambulatorial',
    title: 'Pacientes do Ambulatorio',
  },
  'pacientes/demandas_especificas': {
    breadcrumbItems: ['Inicio', 'Operacao', 'Pacientes', 'Demandas Especificas'],
    status: 'Demandas especificas',
    title: 'Demandas Especificas',
  },
  estoque: {
    breadcrumbItems: ['Inicio', 'Operacao', 'Movimentacao de Estoque', 'Estoque'],
    description: 'Base pronta para consultas de saldo, lotes, alertas e movimentacoes com foco operacional.',
    status: 'Modulo planejado',
    title: 'Estoque',
  },
  'estoque/listar': {
    breadcrumbItems: ['Inicio', 'Operacao', 'Movimentacao de Estoque', 'Estoque', 'Listar'],
    status: 'Consulta de estoque',
    title: 'Listagem do Estoque',
  },
  'estoque/transferencia_depositos/nova_solicitacao': {
    breadcrumbItems: ['Inicio', 'Operacao', 'Movimentacao de Estoque', 'Transferencias', 'Nova Solicitacao'],
    description: '',
    status: 'Solicitacao de transferencia',
    title: 'Nova Solicitacao',
  },
  'estoque/transferencia_depositos/solicitacoes_abertas': {
    breadcrumbItems: ['Inicio', 'Operacao', 'Movimentacao de Estoque', 'Transferencias', 'Solicitacoes Abertas'],
    description: '',
    status: 'Solicitacoes abertas',
    title: 'Solicitacoes Abertas',
  },
  'estoque/transferencia_depositos/solicitacoes_encerradas': {
    breadcrumbItems: ['Inicio', 'Operacao', 'Movimentacao de Estoque', 'Transferencias', 'Solicitacoes Encerradas'],
    description: '',
    status: 'Solicitacoes encerradas',
    title: 'Solicitações de Transferências Encerradas',
  },
  'estoque/consultar_movimentacoes': {
    breadcrumbItems: ['Inicio', 'Operacao', 'Movimentacao de Estoque', 'Estoque', 'Consultar Movimentacoes'],
    status: 'Consulta de movimentacoes',
    title: 'Consultar Movimentacoes',
  },
  'requisicoes/por_paciente': {
    breadcrumbItems: ['Inicio', 'Operacao', 'Requisicoes Medicamentos', 'Por Paciente'],
    status: 'Modulo planejado',
    title: 'Requisicoes por Paciente',
  },
  'requisicoes/aprovacao': {
    breadcrumbItems: ['Inicio', 'Operacao', 'Requisicoes Medicamentos', 'Aprovar Requisicao'],
    status: 'Fluxo de aprovacao',
    title: 'Aprovar Requisicao',
  },
  'requisicoes/por_setor': {
    breadcrumbItems: ['Inicio', 'Operacao', 'Requisicoes Medicamentos', 'Por Setor'],
    description: '',
    status: 'Nova requisicao',
    title: 'Requisicoes por Setor',
  },
  'requisicoes/listar_por_periodo': {
    breadcrumbItems: ['Inicio', 'Operacao', 'Requisicoes Medicamentos', 'Listar por Periodo'],
    description: '',
    status: 'Consulta de requisicoes',
    title: 'Listar Requisicoes por Periodo',
  },
  'requisicoes/devolucao_medicamento': {
    breadcrumbItems: ['Inicio', 'Operacao', 'Requisicoes Medicamentos', 'Devolucao Medicamento'],
    description: '',
    status: 'Modulo planejado',
    title: 'Devolucao Medicamento',
  },
  'requisicoes/controle_dose_domiciliar': {
    breadcrumbItems: ['Inicio', 'Operacao', 'Requisicoes Medicamentos', 'Controle Dose Domiciliar'],
    description: '',
    status: 'Controle DDU',
    title: 'Controle Dose Domiciliar',
  },
  'operacao/entradas/nova': {
    breadcrumbItems: ['Inicio', 'Operacao', 'Movimentacao de Estoque', 'Entrada Medicamentos', 'Nova Entrada'],
    description: '',
    status: 'Movimentacao de estoque',
    title: 'Nova Entrada',
  },
  'operacao/entradas/listar': {
    breadcrumbItems: ['Inicio', 'Operacao', 'Movimentacao de Estoque', 'Entrada Medicamentos', 'Listar Entradas'],
    description: '',
    status: 'Consulta de entradas',
    title: 'Listar Entradas',
  },
  'operacao/entradas/demandas': {
    breadcrumbItems: ['Inicio', 'Operacao', 'Movimentacao de Estoque', 'Entrada Medicamentos', 'Entrada Medicamentos Demanda Especifica'],
    description: '',
    status: 'Movimentacao de estoque',
    title: 'Entrada Medicamentos Demanda Especifica',
  },
  'operacao/entradas/aprovacao': {
    breadcrumbItems: ['Inicio', 'Operacao', 'Movimentacao de Estoque', 'Entrada Medicamentos', 'Aprovacao Entrada'],
    description: '',
    status: 'Fluxo de aprovacao',
    title: 'Aprovacao Entrada',
  },
  'operacao/inventarios/novo': {
    breadcrumbItems: ['Inicio', 'Operacao', 'Inventarios', 'Novo'],
    description: '',
    status: 'Inventario de estoque',
    title: 'Novo Inventario',
  },
  'operacao/inventarios/listar': {
    breadcrumbItems: ['Inicio', 'Operacao', 'Inventarios', 'Listar'],
    description: '',
    status: 'Consulta de inventarios',
    title: 'Listar Inventarios',
  },
  'parametros/boname': {
    breadcrumbItems: ['Inicio', 'Cadastros', 'Boname'],
    description: '',
    status: 'Cadastro mestre',
    title: 'Cadastro de Boname',
  },
  'parametros/depositos': {
    breadcrumbItems: ['Inicio', 'Cadastros', 'Depositos'],
    description: '',
    status: 'Cadastro mestre',
    title: 'Cadastro de Depositos',
  },
  'parametros/fornecedores': {
    breadcrumbItems: ['Inicio', 'Cadastros', 'Fornecedores'],
    description: '',
    status: 'Cadastro mestre',
    title: 'Cadastro de Fornecedores',
  },
  'parametros/medicamentos': {
    breadcrumbItems: ['Inicio', 'Cadastros', 'Medicamentos'],
    description: '',
    status: 'Cadastro mestre',
    title: 'Cadastro de Medicamentos',
  },
  'parametros/diagnosticos': {
    breadcrumbItems: ['Inicio', 'Cadastros', 'Diagnosticos'],
    description: '',
    status: 'Cadastro mestre',
    title: 'Cadastro de Diagnosticos',
  },
  'parametros/locais': {
    breadcrumbItems: ['Inicio', 'Cadastros', 'Locais Requisicao'],
    description: '',
    status: 'Cadastro mestre',
    title: 'Cadastro de Locais Requisicao',
  },
  'parametros/tipos_medicamentos': {
    breadcrumbItems: ['Inicio', 'Cadastros', 'Tipos de Medicamentos'],
    description: '',
    status: 'Cadastro mestre',
    title: 'Cadastro de Tipos de Medicamentos',
  },
  'parametros/setores': {
    breadcrumbItems: ['Inicio', 'Cadastros', 'Setores'],
    description: '',
    status: 'Cadastro mestre',
    title: 'Cadastro de Setores',
  },
  'parametros/tipos_requisicoes': {
    breadcrumbItems: ['Inicio', 'Cadastros', 'Tipos de Requisicoes'],
    description: '',
    status: 'Cadastro mestre',
    title: 'Cadastro de Tipos de Requisicoes',
  },
}

export const NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    title: 'Visao geral',
    items: [
      {
        eventKey: 'inicio',
        icon: <RiDashboardLine size={18} />,
        label: 'Dashboard',
      },
    ],
  },
  {
    icon: <RiToolsLine size={18} />,
    title: 'Operacao',
    items: [
      {
        children: [
          {
            eventKey: 'pacientes/ambulatorio',
            icon: <RiUserLine size={18} />,
            label: 'Ambulatorio',
          },
          {
            eventKey: 'pacientes/demandas_especificas',
            icon: <RiFileSearchLine size={18} />,
            label: 'Demandas Especificas',
          },
        ],
        icon: <RiTeamLine size={18} />,
        label: 'Pacientes',
      },
      {
        children: [
          {
            children: [
              {
                eventKey: 'estoque/listar',
                icon: <RiArchiveDrawerLine size={18} />,
                label: 'Listar Saldo Disponivel',
              },
              {
                eventKey: 'estoque/consultar_movimentacoes',
                icon: <RiFileHistoryLine size={18} />,
                label: 'Listar Movimentacoes',
              },
            ],
            icon: <RiDatabase2Line size={18} />,
            label: 'Estoque',
          },
          {
            children: [
              {
                eventKey: 'estoque/transferencia_depositos/nova_solicitacao',
                icon: <RiAddLine size={18} />,
                label: 'Nova Solicitacao',
              },
              {
                eventKey: 'estoque/transferencia_depositos/solicitacoes_abertas',
                icon: <RiFileList3Line size={18} />,
                label: 'Solicitacoes Abertas',
              },
              {
                eventKey: 'estoque/transferencia_depositos/solicitacoes_encerradas',
                icon: <RiHistoryLine size={18} />,
                label: 'Solicitações Encerradas',
              },
            ],
            icon: <RiSwapBoxLine size={18} />,
            label: 'Transferencias',
          },
          {
            children: [
              {
                eventKey: 'operacao/entradas/nova',
                icon: <RiAddLine size={18} />,
                label: 'Nova Entrada',
              },
              {
                eventKey: 'operacao/entradas/listar',
                icon: <RiFolderOpenLine size={18} />,
                label: 'Listar Entradas',
              },
              {
                eventKey: 'operacao/entradas/demandas',
                icon: <RiFileTransferLine size={18} />,
                label: 'Entrada Demanda Espec',
              },
              {
                eventKey: 'operacao/entradas/aprovacao',
                icon: <RiVerifiedBadgeLine size={18} />,
                label: 'Aprovacao Entrada',
              },
            ],
            icon: <RiInboxArchiveLine size={18} />,
            label: 'Entrada Medicamentos',
          },
        ],
        icon: <RiRouteLine size={18} />,
        label: 'Movimentacao de Estoque',
      },
      {
        children: [
          {
            eventKey: 'operacao/inventarios/listar',
            icon: <RiFileList3Line size={18} />,
            label: 'Listar',
          },
          {
            eventKey: 'operacao/inventarios/novo',
            icon: <RiAddLine size={18} />,
            label: 'Novo',
          },
        ],
        icon: <RiListCheck3 size={18} />,
        label: 'Inventarios',
      },
      {
        children: [
          {
            eventKey: 'requisicoes/por_paciente',
            icon: <RiUserLine size={18} />,
            label: 'Por Paciente',
          },
          {
            eventKey: 'requisicoes/por_setor',
            icon: <RiBuilding2Line size={18} />,
            label: 'Por Setor',
          },
          {
            eventKey: 'requisicoes/aprovacao',
            icon: <RiVerifiedBadgeLine size={18} />,
            label: 'Aprovar Requisicao',
          },
          {
            eventKey: 'requisicoes/listar_por_periodo',
            icon: <RiFileHistoryLine size={18} />,
            label: 'Listar por Periodo',
          },
          {
            eventKey: 'requisicoes/devolucao_medicamento',
            icon: <RiRefund2Line size={18} />,
            label: 'Devolucao Medicamento',
          },
          {
            eventKey: 'requisicoes/controle_dose_domiciliar',
            icon: <RiHomeHeartLine size={18} />,
            label: 'Controle Dose Domiciliar',
          },
        ],
        icon: <RiClipboardLine size={18} />,
        label: 'Requisicoes Medicamentos',
      },
    ],
  },
  {
    icon: <RiSettings3Line size={18} />,
    title: 'Cadastros',
    items: [
      {
        badge: 'novo',
        eventKey: 'parametros/boname',
        icon: <RiBookletLine size={18} />,
        label: 'Boname',
      },
      {
        eventKey: 'parametros/depositos',
        icon: <RiShapesLine size={18} />,
        label: 'Depositos',
      },
      {
        eventKey: 'parametros/fornecedores',
        icon: <RiTruckLine size={18} />,
        label: 'Fornecedores',
      },
      {
        eventKey: 'parametros/locais',
        icon: <RiMapPinLine size={18} />,
        label: 'Locais Requisicao',
      },
      {
        eventKey: 'parametros/setores',
        icon: <RiNodeTree size={18} />,
        label: 'Setores',
      },
      {
        eventKey: 'parametros/medicamentos',
        icon: <RiCapsuleLine size={18} />,
        label: 'Medicamentos',
      },
      {
        eventKey: 'parametros/tipos_medicamentos',
        icon: <RiPriceTag3Line size={18} />,
        label: 'Tipos de Medicamentos',
      },
      {
        eventKey: 'parametros/tipos_requisicoes',
        icon: <RiFileSettingsLine size={18} />,
        label: 'Tipos de Requisicoes',
      },
      {
        eventKey: 'parametros/diagnosticos',
        icon: <RiStethoscopeLine size={18} />,
        label: 'Diagnosticos',
      },
    ],
  },
]

export const QUICK_ACTIONS: Array<{ eventKey: SectionKey; label: string }> = [
  { eventKey: 'inicio', label: 'Abrir dashboard' },
  { eventKey: 'operacao/entradas/nova', label: 'Registrar entrada de medicamentos' },
  { eventKey: 'operacao/entradas/listar', label: 'Abrir listagem de entradas' },
  { eventKey: 'operacao/entradas/demandas', label: 'Abrir entrada de mercadoria demandas' },
  { eventKey: 'operacao/entradas/aprovacao', label: 'Abrir aprovacao de entrada' },
  { eventKey: 'operacao/inventarios/listar', label: 'Listar inventarios' },
  { eventKey: 'operacao/inventarios/novo', label: 'Criar inventario' },
  { eventKey: 'parametros/boname', label: 'Abrir cadastro de Boname' },
  { eventKey: 'parametros/depositos', label: 'Abrir cadastro de Depositos' },
  { eventKey: 'parametros/fornecedores', label: 'Abrir cadastro de Fornecedores' },
  { eventKey: 'parametros/locais', label: 'Abrir cadastro de Locais Requisicao' },
  { eventKey: 'parametros/setores', label: 'Abrir cadastro de Setores' },
  { eventKey: 'parametros/medicamentos', label: 'Abrir cadastro de Medicamentos' },
  { eventKey: 'parametros/tipos_medicamentos', label: 'Abrir tipos de medicamentos' },
  { eventKey: 'parametros/tipos_requisicoes', label: 'Abrir tipos de requisicoes' },
  { eventKey: 'parametros/diagnosticos', label: 'Abrir cadastro de Diagnosticos' },
  { eventKey: 'pacientes/ambulatorio', label: 'Consultar pacientes do ambulatorio' },
  { eventKey: 'pacientes/demandas_especificas', label: 'Consultar demandas especificas' },
  { eventKey: 'requisicoes/por_paciente', label: 'Consultar requisicoes por paciente' },
  { eventKey: 'requisicoes/aprovacao', label: 'Aprovar requisicoes' },
  { eventKey: 'requisicoes/por_setor', label: 'Nova requisicao por setor' },
  { eventKey: 'requisicoes/listar_por_periodo', label: 'Listar requisicoes por periodo' },
  { eventKey: 'estoque/listar', label: 'Consultar estoque' },
]
