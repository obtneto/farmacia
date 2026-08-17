import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import CheckIcon from '@rsuite/icons/Check'
import CloseIcon from '@rsuite/icons/Close'
import EditIcon from '@rsuite/icons/Edit'
import PlusIcon from '@rsuite/icons/Plus'
import ReloadIcon from '@rsuite/icons/Reload'
import SearchIcon from '@rsuite/icons/Search'
import VisibleIcon from '@rsuite/icons/Visible'
import { Button, HStack, IconButton, Input, InputNumber, Pagination, Panel, SelectPicker, useMediaQuery } from 'rsuite'
import { Cell, Column, HeaderCell, Table } from 'rsuite-table'
import { AppModal, DataState, PageSection, StatusBadge, SummaryCard } from '../../components/ui'
import { getErrorMessage, useMessage } from '../../hooks/useMessage'
import { getApiBaseUrl } from '../../lib/api-base-url'
import { apiRequest } from '../../lib/api'
import '../boname/BonameCrudPage.css'

type ApiListPayload<T> = T[] | [T[]]

export interface DemandaEspecificaRecord {
  data_nascimento?: string | null
  dem_diag_id?: number | null
  dem_id: number
  dem_medico_assis?: string | null
  dem_medico_crm?: string | null
  dem_pac_id?: number | null
  dem_responsavel?: string | null
  diagnostico?: string | null
  nome_paciente?: string | null
}

export interface DemandaEspecificaItemRecord {
  isDraft?: boolean
  ite_dem_med_id: number
  ite_dem_med_qtde: number
  ite_dem_med_ativo?: number | null
  ite_id: number
  med_descr?: string | null
  med_descr_coml?: string | null
}

interface DiagnosticoOptionRecord {
  diag_descr: string
  diag_id: number
}

interface MedicamentoOptionRecord {
  med_descr: string
  med_descr_coml?: string | null
  med_id: number
}

interface PacienteLookupRecord {
  cpf?: string | null
  dt_nascimento?: string | null
  email?: string | null
  nom_paciente?: string | null
  nom_social?: string | null
  num_paciente: number
}

interface SelectOption {
  label: string
  value: number
}

interface ItemFormValues {
  dem_med_id: number
  dem_med_qtde: number
  id: number
}

interface DemandaFormValues {
  dem_diag_id: number
  dem_medico_assis: string
  dem_medico_crm: string
  dem_pac_id: number
  dem_responsavel: string
  id: number
}

type DemandaFormErrors = Partial<Record<'dem_diag_id' | 'dem_medico_assis' | 'dem_medico_crm' | 'dem_pac_id', string>>
type ItemFormErrors = Partial<Record<'dem_med_id' | 'dem_med_qtde', string>>

export interface DemandasEspecificasCrudPageProps {
  apiBaseUrl?: string
}

const PAGE_SIZE = 10
const MODAL_PAGE_SIZE = 8
const DEFAULT_ITEM_FORM_VALUES: ItemFormValues = {
  dem_med_id: 0,
  dem_med_qtde: 0,
  id: 0,
}
const DEFAULT_DEMANDA_FORM_VALUES: DemandaFormValues = {
  dem_diag_id: 0,
  dem_medico_assis: '',
  dem_medico_crm: '',
  dem_pac_id: 0,
  dem_responsavel: '',
  id: 0,
}

function normalizeRows<T>(payload: ApiListPayload<T>): T[] {
  if (!Array.isArray(payload)) {
    return []
  }
  if (payload.length > 0 && Array.isArray(payload[0])) {
    return payload[0] as T[]
  }
  return payload as T[]
}

function formatText(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return '-'
  }
  const normalized = String(value).trim()
  return normalized ? normalized : '-'
}

function formatCpf(value: string | null | undefined) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (!digits) {
    return '-'
  }
  if (digits.length !== 11) {
    return formatText(value)
  }
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function formatDateForDisplay(value: string | null | undefined) {
  if (!value) {
    return '-'
  }
  const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return '-'
  }
  return parsed.toLocaleDateString('pt-BR')
}

function createDraftItemRecord(
  values: ItemFormValues,
  medicamentoLabel: string,
  currentRecord?: DemandaEspecificaItemRecord | null,
): DemandaEspecificaItemRecord {
  const [med_descr = '', med_descr_coml = ''] = medicamentoLabel.split(' - ')
  return {
    isDraft: currentRecord?.isDraft ?? !currentRecord,
    ite_dem_med_id: Number(values.dem_med_id || 0),
    ite_dem_med_qtde: Number(values.dem_med_qtde || 0),
    ite_id: Number(currentRecord?.ite_id || values.id || Date.now()),
    med_descr,
    med_descr_coml,
  }
}

function createDemandaFormValues(
  paciente: PacienteLookupRecord | null,
  record?: DemandaEspecificaRecord | null,
): DemandaFormValues {
  return {
    dem_diag_id: Number(record?.dem_diag_id || 0),
    dem_medico_assis: String(record?.dem_medico_assis || ''),
    dem_medico_crm: String(record?.dem_medico_crm || ''),
    dem_pac_id: Number(record?.dem_pac_id || paciente?.num_paciente || 0),
    dem_responsavel: String(record?.dem_responsavel || ''),
    id: Number(record?.dem_id || 0),
  }
}

function createPacienteLookupFromDemanda(record: DemandaEspecificaRecord): PacienteLookupRecord {
  return {
    cpf: null,
    dt_nascimento: record.data_nascimento ?? null,
    email: null,
    nom_paciente: record.nome_paciente ?? null,
    nom_social: null,
    num_paciente: Number(record.dem_pac_id ?? 0),
  }
}

function validateItemForm(values: ItemFormValues): ItemFormErrors {
  const errors: ItemFormErrors = {}
  if (!values.dem_med_id || values.dem_med_id <= 0) {
    errors.dem_med_id = 'Selecione o medicamento.'
  }
  if (!Number.isFinite(values.dem_med_qtde) || values.dem_med_qtde <= 0) {
    errors.dem_med_qtde = 'Informe uma quantidade maior que zero.'
  }
  return errors
}

function validateDemandaForm(values: DemandaFormValues): DemandaFormErrors {
  const errors: DemandaFormErrors = {}
  if (!values.dem_pac_id || values.dem_pac_id <= 0) {
    errors.dem_pac_id = 'Selecione um paciente valido.'
  }
  if (!values.dem_medico_assis.trim()) {
    errors.dem_medico_assis = 'Informe o medico assistente.'
  }
  if (!values.dem_medico_crm.trim()) {
    errors.dem_medico_crm = 'Informe o CRM do medico.'
  }
  if (!values.dem_diag_id || values.dem_diag_id <= 0) {
    errors.dem_diag_id = 'Selecione o diagnostico.'
  }
  return errors
}

async function listarDemandasEspecificas() {
  const payload = await apiRequest<ApiListPayload<DemandaEspecificaRecord>>('/demandas-especificas/listar/', { method: 'GET' })
  return normalizeRows(payload)
}

async function listarItensDemanda(demPacId: number) {
  const payload = await apiRequest<ApiListPayload<DemandaEspecificaItemRecord>>(
    `/demandas-especificas/listar-itens-demandas/${demPacId}`,
    { method: 'GET' },
  )
  return normalizeRows(payload)
}

async function listarItensDemandaPorPaciente(demPacId: number) {
  const payload = await apiRequest<ApiListPayload<DemandaEspecificaItemRecord>>(
    `/demandas-especificas/listar-itens-demandas/${demPacId}`,
    { method: 'GET' },
  )
  return normalizeRows(payload)
}

async function listarMedicamentosOptions() {
  const payload = await apiRequest<ApiListPayload<MedicamentoOptionRecord>>('/parametros/medicamentos/listar/*', { method: 'GET' })
  return normalizeRows(payload)
}

async function listarDiagnosticosAtivos() {
  const payload = await apiRequest<ApiListPayload<DiagnosticoOptionRecord>>('/parametros/diagnosticos/listar_ativos/*', { method: 'GET' })
  return normalizeRows(payload)
}

async function listarPacientes(pesquisa: string) {
  const payload = await apiRequest<ApiListPayload<PacienteLookupRecord>>(
    `/pacientes/listar_pacientes/${encodeURIComponent(pesquisa || '*')}`,
    { method: 'GET' },
  )
  return normalizeRows(payload)
}

async function salvarItemDemanda(demandaId: number, values: ItemFormValues) {
  await apiRequest('/itens-demandas/salvar', {
    body: JSON.stringify({
      dem_id: demandaId,
      dem_med_ativo: 1,
      dem_med_id: values.dem_med_id,
      dem_med_qtde: values.dem_med_qtde,
      id: values.id,
    }),
    method: 'POST',
  })
}

async function excluirItemDemanda(itemId: number) {
  await apiRequest(`/itens-demandas/excluir/${itemId}`, { method: 'DELETE' })
}

async function ativarDesativarItemDemanda(itemId: number) {
  await apiRequest(`/itens-demandas/ativar_desativar/${itemId}`, { method: 'GET' })
}

async function salvarDemandaEspecifica(values: DemandaFormValues, itens: DemandaEspecificaItemRecord[]) {
  return apiRequest<{ dem_id: number }>('/demandas-especificas/salvar', {
    body: JSON.stringify({
      id: values.id,
      dem_diag_id: values.dem_diag_id,
      dem_medico_assis: values.dem_medico_assis,
      dem_medico_assit: values.dem_medico_assis,
      dem_medico_crm: values.dem_medico_crm,
      dem_pac_id: values.dem_pac_id,
      dem_responsavel: values.dem_responsavel,
      itens: itens.map((item) => ({
        dem_med_id: item.ite_dem_med_id,
        dem_med_qtde: item.ite_dem_med_qtde,
        ite_id: item.isDraft ? 0 : item.ite_id,
      })),
    }),
    method: 'POST',
  })
}

export default function DemandasEspecificasCrudPage({
  apiBaseUrl = getApiBaseUrl(),
}: DemandasEspecificasCrudPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const message = useMessage()
  const queryClient = useQueryClient()
  const [filterValue, setFilterValue] = useState('')
  const [activePage, setActivePage] = useState(1)
  const [modalActivePage, setModalActivePage] = useState(1)
  const [selectedDemanda, setSelectedDemanda] = useState<DemandaEspecificaRecord | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [addPacienteModalOpen, setAddPacienteModalOpen] = useState(false)
  const [patientLookupModalOpen, setPatientLookupModalOpen] = useState(false)
  const [patientLookupTableInstance, setPatientLookupTableInstance] = useState(0)
  const [editingItem, setEditingItem] = useState<DemandaEspecificaItemRecord | null>(null)
  const [itemFormValues, setItemFormValues] = useState<ItemFormValues>(DEFAULT_ITEM_FORM_VALUES)
  const [itemFormErrors, setItemFormErrors] = useState<ItemFormErrors>({})
  const [demandaFormValues, setDemandaFormValues] = useState<DemandaFormValues>(DEFAULT_DEMANDA_FORM_VALUES)
  const [demandaFormErrors, setDemandaFormErrors] = useState<DemandaFormErrors>({})
  const [pacienteModalMode, setPacienteModalMode] = useState<'create' | 'edit'>('create')
  const [selectedPaciente, setSelectedPaciente] = useState<PacienteLookupRecord | null>(null)
  const [draftPacienteItens, setDraftPacienteItens] = useState<DemandaEspecificaItemRecord[]>([])
  const [removedPacienteItemIds, setRemovedPacienteItemIds] = useState<number[]>([])
  const [patientSearchValue, setPatientSearchValue] = useState('')
  const [submittedPatientSearch, setSubmittedPatientSearch] = useState<string | null>(null)
  const [patientLookupPage, setPatientLookupPage] = useState(1)
  const addPacienteSeedKeyRef = useRef('')

  const listQuery = useQuery({
    queryKey: ['demandas-especificas-list', apiBaseUrl],
    queryFn: listarDemandasEspecificas,
  })

  const medicamentosQuery = useQuery({
    queryKey: ['demandas-especificas-medicamentos', apiBaseUrl],
    queryFn: listarMedicamentosOptions,
  })

  const diagnosticosQuery = useQuery({
    queryKey: ['demandas-especificas-diagnosticos', apiBaseUrl],
    queryFn: listarDiagnosticosAtivos,
    enabled: addPacienteModalOpen,
  })

  const itensQuery = useQuery({
    queryKey: ['demandas-especificas-itens', selectedDemanda?.dem_pac_id ?? null, apiBaseUrl],
    queryFn: () => listarItensDemanda(Number(selectedDemanda?.dem_pac_id ?? 0)),
    enabled: detailsModalOpen && selectedDemanda !== null,
  })

  const selectedPacienteDemanda = useMemo(() => {
    if (!selectedPaciente) {
      return null
    }
    return (listQuery.data ?? []).find((record) => Number(record.dem_pac_id ?? 0) === Number(selectedPaciente.num_paciente))
  }, [listQuery.data, selectedPaciente])

  const addPacienteItensQuery = useQuery({
    queryKey: ['demandas-especificas-add-paciente-itens', selectedPaciente?.num_paciente ?? null, apiBaseUrl],
    queryFn: () => listarItensDemandaPorPaciente(Number(selectedPaciente?.num_paciente ?? 0)),
    enabled: addPacienteModalOpen && selectedPaciente !== null,
    retry: false,
  })

  const pacientesLookupQuery = useQuery({
    queryKey: ['demandas-especificas-pacientes', submittedPatientSearch, apiBaseUrl],
    queryFn: () => listarPacientes(submittedPatientSearch ?? '*'),
    enabled: patientLookupModalOpen && submittedPatientSearch !== null,
    retry: false,
  })

  useEffect(() => {
    if (!addPacienteModalOpen || !selectedPaciente) {
      addPacienteSeedKeyRef.current = ''
      return
    }

    if (selectedPacienteDemanda) {
      if (!addPacienteItensQuery.isSuccess) {
        return
      }

      const nextKey = `existing:${selectedPaciente.num_paciente}:${selectedPacienteDemanda.dem_id}`
      if (addPacienteSeedKeyRef.current === nextKey) {
        return
      }

      setDemandaFormValues(createDemandaFormValues(selectedPaciente, selectedPacienteDemanda))
      setDemandaFormErrors({})
      setDraftPacienteItens((addPacienteItensQuery.data ?? []).map((item) => ({ ...item, isDraft: false })))
      setRemovedPacienteItemIds([])
      addPacienteSeedKeyRef.current = nextKey
      return
    }

    const nextKey = `new:${selectedPaciente.num_paciente}`
    if (addPacienteSeedKeyRef.current === nextKey) {
      return
    }

    setDemandaFormValues(createDemandaFormValues(selectedPaciente))
    setDemandaFormErrors({})
    setDraftPacienteItens([])
    setRemovedPacienteItemIds([])
    addPacienteSeedKeyRef.current = nextKey
  }, [
    addPacienteItensQuery.data,
    addPacienteItensQuery.isSuccess,
    addPacienteModalOpen,
    selectedPaciente,
    selectedPacienteDemanda,
  ])

  const saveItemMutation = useMutation({
    mutationFn: (values: ItemFormValues) =>
      salvarItemDemanda(Number((addPacienteModalOpen ? selectedPacienteDemanda?.dem_id : selectedDemanda?.dem_id) ?? 0), values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['demandas-especificas-itens', selectedDemanda?.dem_pac_id ?? null, apiBaseUrl],
      })
      await queryClient.invalidateQueries({
        queryKey: ['demandas-especificas-add-paciente-itens', selectedPaciente?.num_paciente ?? null, apiBaseUrl],
      })
    message.success(editingItem ? 'Item atualizado.' : 'Item adicionado.')
    handleCloseItemModal()
  },
    onError: (error) => {
      message.error('Nao foi possivel salvar o item.', getErrorMessage(error, 'Erro ao salvar item da demanda.'))
    },
  })

  const toggleItemMutation = useMutation({
    mutationFn: ativarDesativarItemDemanda,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['demandas-especificas-itens', selectedDemanda?.dem_pac_id ?? null, apiBaseUrl],
      })
      await queryClient.invalidateQueries({
        queryKey: ['demandas-especificas-add-paciente-itens', selectedPaciente?.num_paciente ?? null, apiBaseUrl],
      })
      message.success('Status do item atualizado.')
    },
    onError: (error) => {
      message.error('Nao foi possivel atualizar o status do item.', getErrorMessage(error, 'Erro ao ativar ou desativar item da demanda.'))
    },
  })

  const saveDemandaMutation = useMutation({
    mutationFn: async ({ items, values }: { items: DemandaEspecificaItemRecord[]; values: DemandaFormValues }) => {
      const response = await salvarDemandaEspecifica(values, items)
      if (removedPacienteItemIds.length > 0) {
        await Promise.all(removedPacienteItemIds.map((itemId) => excluirItemDemanda(itemId)))
      }
      return response
    },
    onSuccess: async () => {
      message.success('Demanda especifica salva.')
      handleCloseAddPacienteModal()
      await queryClient.invalidateQueries({ queryKey: ['demandas-especificas-list'] })
      await queryClient.invalidateQueries({ queryKey: ['demandas-especificas-add-paciente-itens'] })
    },
    onError: (error) => {
      message.error('Nao foi possivel salvar a demanda.', getErrorMessage(error, 'Erro ao salvar a demanda especifica.'))
    },
  })

  const filteredRecords = useMemo(() => {
    const normalizedFilter = filterValue.trim().toLocaleLowerCase('pt-BR')
    const records = listQuery.data ?? []
    if (!normalizedFilter) {
      return records
    }
    return records.filter((record) => {
      const haystack = [
        record.dem_id,
        record.nome_paciente,
        record.dem_medico_assis,
        record.dem_medico_crm,
        record.dem_responsavel,
        record.diagnostico,
      ]
        .map((value) => String(value ?? '').toLocaleLowerCase('pt-BR'))
        .join(' ')
      return haystack.includes(normalizedFilter)
    })
  }, [filterValue, listQuery.data])

  const medicamentoOptions = useMemo<SelectOption[]>(
    () =>
      (medicamentosQuery.data ?? []).map((item) => ({
        label: item.med_descr_coml?.trim() ? `${item.med_descr} - ${item.med_descr_coml}` : item.med_descr,
        value: Number(item.med_id),
      })),
    [medicamentosQuery.data],
  )

  const selectedMedicamentoLabel = useMemo(() => {
    if (!itemFormValues.dem_med_id) {
      return ''
    }
    return medicamentoOptions.find((item) => item.value === itemFormValues.dem_med_id)?.label ?? ''
  }, [itemFormValues.dem_med_id, medicamentoOptions])

  const diagnosticoOptions = useMemo<SelectOption[]>(
    () =>
      (diagnosticosQuery.data ?? []).map((item) => ({
        label: item.diag_descr,
        value: Number(item.diag_id),
      })),
    [diagnosticosQuery.data],
  )

  const currentPage = Math.min(activePage, Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE)))
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const paginatedRecords = filteredRecords.slice(pageStart, pageStart + PAGE_SIZE)
  const tableHeight = isCompactLayout ? 360 : 420

  const itens = itensQuery.data ?? []
  const currentModalPage = Math.min(modalActivePage, Math.max(1, Math.ceil(itens.length / MODAL_PAGE_SIZE)))
  const modalPageStart = (currentModalPage - 1) * MODAL_PAGE_SIZE
  const paginatedItens = itens.slice(modalPageStart, modalPageStart + MODAL_PAGE_SIZE)
  const pacientesPesquisados = pacientesLookupQuery.data ?? []
  const currentPatientLookupPage = Math.min(patientLookupPage, Math.max(1, Math.ceil(pacientesPesquisados.length / PAGE_SIZE)))
  const patientLookupPageStart = (currentPatientLookupPage - 1) * PAGE_SIZE
  const paginatedPacientes = pacientesPesquisados.slice(patientLookupPageStart, patientLookupPageStart + PAGE_SIZE)
  const patientLookupTableHeight = Math.min(Math.max(paginatedPacientes.length * 54 + 112, 280), 560)

  const handleOpenDetails = (record: DemandaEspecificaRecord) => {
    setSelectedDemanda(record)
    setModalActivePage(1)
    setDetailsModalOpen(true)
  }

  const handleCloseItemModal = () => {
    setItemModalOpen(false)
    setEditingItem(null)
    setItemFormValues(DEFAULT_ITEM_FORM_VALUES)
    setItemFormErrors({})
  }

  const handleCloseDetails = () => {
    setDetailsModalOpen(false)
    setSelectedDemanda(null)
    handleCloseItemModal()
  }

  const handleSaveItem = async () => {
    const validationErrors = validateItemForm(itemFormValues)
    setItemFormErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      return
    }
    if (addPacienteModalOpen) {
      const nextItem = createDraftItemRecord(itemFormValues, selectedMedicamentoLabel, editingItem)
      setDraftPacienteItens((current) => {
        if (editingItem) {
          return current.map((item) => (item.ite_id === editingItem.ite_id ? nextItem : item))
        }
        return [...current, nextItem]
      })
      message.success(editingItem ? 'Item atualizado.' : 'Item adicionado.')
      handleCloseItemModal()
      return
    }
    await saveItemMutation.mutateAsync(itemFormValues)
  }

  const handleToggleItem = async (record: DemandaEspecificaItemRecord) => {
    await toggleItemMutation.mutateAsync(record.ite_id)
  }

  const handleSaveDemanda = async () => {
    const nextValues = {
      ...demandaFormValues,
      dem_pac_id: Number(selectedPaciente?.num_paciente ?? demandaFormValues.dem_pac_id ?? 0),
    }
    const validationErrors = validateDemandaForm(nextValues)
    setDemandaFormValues(nextValues)
    setDemandaFormErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    await saveDemandaMutation.mutateAsync({
      items: draftPacienteItens,
      values: nextValues,
    })
  }

  const handleCloseAddPacienteModal = () => {
    setAddPacienteModalOpen(false)
    setPatientLookupModalOpen(false)
    setPatientLookupPage(1)
    setSubmittedPatientSearch(null)
    setDemandaFormValues(DEFAULT_DEMANDA_FORM_VALUES)
    setDemandaFormErrors({})
    setDraftPacienteItens([])
    setRemovedPacienteItemIds([])
    setSelectedPaciente(null)
    setPatientSearchValue('')
    addPacienteSeedKeyRef.current = ''
    handleCloseItemModal()
  }

  const handleOpenPatientLookupModal = () => {
    setPatientLookupTableInstance((current) => current + 1)
    setPatientLookupModalOpen(true)
    if (submittedPatientSearch === null) {
      setSubmittedPatientSearch('*')
    }
  }

  const handleSearchPatients = () => {
    setSubmittedPatientSearch(patientSearchValue.trim() || '*')
    setPatientLookupPage(1)
  }

  const handleRefreshPatients = () => {
    if (submittedPatientSearch === null) {
      handleSearchPatients()
      return
    }
    void pacientesLookupQuery.refetch()
  }

  const handleSelectPaciente = (record: PacienteLookupRecord) => {
    setSelectedPaciente(record)
    setDemandaFormValues(createDemandaFormValues(record))
    setDemandaFormErrors((current) => ({ ...current, dem_pac_id: undefined }))
    setDraftPacienteItens([])
    setRemovedPacienteItemIds([])
    addPacienteSeedKeyRef.current = ''
    setPatientSearchValue(record.nom_paciente?.trim() || String(record.num_paciente))
    setPatientLookupModalOpen(false)
  }

  const handleAddPaciente = () => {
    setPacienteModalMode('create')
    setDemandaFormValues(DEFAULT_DEMANDA_FORM_VALUES)
    setDemandaFormErrors({})
    setSelectedPaciente(null)
    setDraftPacienteItens([])
    setRemovedPacienteItemIds([])
    setPatientSearchValue('')
    setSubmittedPatientSearch(null)
    addPacienteSeedKeyRef.current = ''
    setAddPacienteModalOpen(true)
  }

  const handleEditPaciente = (record: DemandaEspecificaRecord) => {
    setPacienteModalMode('edit')
    setDemandaFormValues(createDemandaFormValues(createPacienteLookupFromDemanda(record), record))
    setDemandaFormErrors({})
    setDraftPacienteItens([])
    setRemovedPacienteItemIds([])
    setSelectedPaciente(createPacienteLookupFromDemanda(record))
    setPatientSearchValue(record.nome_paciente?.trim() || String(record.dem_pac_id || ''))
    setSubmittedPatientSearch(null)
    addPacienteSeedKeyRef.current = ''
    setAddPacienteModalOpen(true)
  }

  const renderMainActions = (record: DemandaEspecificaRecord, compact = false) => {
    if (compact) {
      return (
        <HStack spacing={8} className="boname-page__row-actions boname-page__row-actions--compact">
          <Button appearance="subtle" size="xs" aria-label="Editar registro" startIcon={<EditIcon />} onClick={() => handleEditPaciente(record)}>
            Editar
          </Button>
          <Button appearance="subtle" size="xs" startIcon={<VisibleIcon />} onClick={() => handleOpenDetails(record)}>
            Itens
          </Button>
        </HStack>
      )
    }

    return (
      <HStack spacing={8} justifyContent="center" className="boname-page__row-actions boname-page__row-actions--table">
        <IconButton
          appearance="subtle"
          aria-label="Editar registro"
          circle
          className="boname-page__action-icon boname-page__action-icon--edit"
          icon={<EditIcon />}
          size="xs"
          onClick={() => handleEditPaciente(record)}
        />
        <IconButton
          appearance="subtle"
          aria-label={`Visualizar itens da demanda ${record.dem_id}`}
          circle
          className="boname-page__action-icon boname-page__action-icon--view"
          icon={<VisibleIcon />}
          size="xs"
          onClick={() => handleOpenDetails(record)}
        />
      </HStack>
    )
  }

  const renderItemActions = (record: DemandaEspecificaItemRecord, compact = false) => {
    const isActive = Number(record.ite_dem_med_ativo ?? 1) === 1
    const actionLabel = isActive ? 'Desativar' : 'Ativar'

    if (compact) {
      return (
        <HStack spacing={8} className="boname-page__row-actions boname-page__row-actions--compact">
          <Button appearance={isActive ? 'subtle' : 'primary'} color={isActive ? 'red' : undefined} loading={toggleItemMutation.isPending} size="xs" onClick={() => void handleToggleItem(record)}>
            {actionLabel}
          </Button>
        </HStack>
      )
    }

    return (
      <HStack spacing={8} justifyContent="center" className="boname-page__row-actions boname-page__row-actions--table">
        <IconButton
          appearance={isActive ? 'subtle' : 'primary'}
          aria-label={`${actionLabel} item ${record.ite_id}`}
          circle
          className={isActive ? 'boname-page__action-icon boname-page__action-icon--delete' : 'boname-page__action-icon'}
          color={isActive ? 'red' : undefined}
          icon={isActive ? <CloseIcon /> : <CheckIcon />}
          loading={toggleItemMutation.isPending}
          size="xs"
          onClick={() => void handleToggleItem(record)}
        />
      </HStack>
    )
  }

  const renderItemStatus = (record: DemandaEspecificaItemRecord) => {
    const isActive = Number(record.ite_dem_med_ativo ?? 1) === 1
    return <StatusBadge tone={isActive ? 'success' : 'danger'}>{isActive ? 'Ativo' : 'Inativo'}</StatusBadge>
  }

  return (
    <section className="boname-page pacientes-page demandas-especificas-page estoque-page--merged-layout">
      <PageSection className="estoque-page__filters-section estoque-page__merged-section">
        <HStack spacing={12} wrap alignItems="flex-start" className="boname-page__toolbar">
          <Input
            aria-label="Filtrar demandas especificas"
            className="boname-page__search-input"
            placeholder="Paciente, medico, CRM, responsavel ou diagnostico"
            value={filterValue}
            onChange={setFilterValue}
          />
          <HStack spacing={8} wrap className="boname-page__toolbar-actions">
            <Button appearance="primary" startIcon={<PlusIcon />} onClick={handleAddPaciente}>
              Adicionar Paciente
            </Button>
            <Button
              appearance="ghost"
              loading={listQuery.isFetching && !listQuery.isPending}
              startIcon={<ReloadIcon />}
              onClick={() => void listQuery.refetch()}
            >
              Atualizar
            </Button>
          </HStack>
        </HStack>

        {listQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando demandas especificas"
            description="Consultando a lista de demandas especificas cadastradas."
          />
        ) : listQuery.isError ? (
          <DataState
            state="error"
            title="Falha ao carregar demandas especificas"
            description={listQuery.error instanceof Error ? listQuery.error.message : 'Nao foi possivel consultar as demandas especificas.'}
            action={
              <Button appearance="primary" startIcon={<ReloadIcon />} onClick={() => void listQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : filteredRecords.length === 0 ? (
          <DataState
            state="empty"
            title="Nenhuma demanda especifica encontrada"
            description="Ajuste o filtro ou atualize a listagem para tentar novamente."
          />
        ) : (
          <>
            <div className="boname-page__table-content">
              {isCompactLayout ? (
                <div className="boname-page__card-list">
                  {paginatedRecords.map((rowData) => (
                    <Panel bordered key={rowData.dem_id} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>{formatText(rowData.nome_paciente)}</strong>
                          <p>Medico: {formatText(rowData.dem_medico_assis)}</p>
                        </div>
                        <StatusBadge tone="info">Demanda {rowData.dem_id}</StatusBadge>
                      </div>
                      <dl className="boname-page__record-meta">
                        <div>
                          <dt>Diagnostico</dt>
                          <dd>{formatText(rowData.diagnostico)}</dd>
                        </div>
                        <div>
                          <dt>CRM</dt>
                          <dd>{formatText(rowData.dem_medico_crm)}</dd>
                        </div>
                        <div>
                          <dt>Nascimento</dt>
                          <dd>{formatDateForDisplay(rowData.data_nascimento)}</dd>
                        </div>
                        <div>
                          <dt>Responsavel</dt>
                          <dd>{formatText(rowData.dem_responsavel)}</dd>
                        </div>
                      </dl>
                      {renderMainActions(rowData, true)}
                    </Panel>
                  ))}
                </div>
              ) : (
                <div className="boname-page__table-wrap">
                  <Table data={paginatedRecords} height={tableHeight} fillHeight virtualized bordered rowHeight={54} headerHeight={52} autoHeight={false}>
                    <Column width={78} align="center" fixed>
                      <HeaderCell>ID</HeaderCell>
                      <Cell dataKey="dem_id" />
                    </Column>
                    <Column flexGrow={1.3} minWidth={230}>
                      <HeaderCell>Paciente</HeaderCell>
                      <Cell>{(rowData: DemandaEspecificaRecord) => formatText(rowData.nome_paciente)}</Cell>
                    </Column>
                    <Column width={132}>
                      <HeaderCell>Nascimento</HeaderCell>
                      <Cell>{(rowData: DemandaEspecificaRecord) => formatDateForDisplay(rowData.data_nascimento)}</Cell>
                    </Column>
                    <Column flexGrow={1.2} minWidth={220}>
                      <HeaderCell>Medico Assistente</HeaderCell>
                      <Cell>{(rowData: DemandaEspecificaRecord) => formatText(rowData.dem_medico_assis)}</Cell>
                    </Column>
                    <Column width={110}>
                      <HeaderCell>CRM</HeaderCell>
                      <Cell>{(rowData: DemandaEspecificaRecord) => formatText(rowData.dem_medico_crm)}</Cell>
                    </Column>
                    <Column flexGrow={1} minWidth={220}>
                      <HeaderCell>Diagnostico</HeaderCell>
                      <Cell>{(rowData: DemandaEspecificaRecord) => formatText(rowData.diagnostico)}</Cell>
                    </Column>
                    <Column width={132} fixed="right">
                      <HeaderCell>Acao</HeaderCell>
                      <Cell>{(rowData: DemandaEspecificaRecord) => renderMainActions(rowData)}</Cell>
                    </Column>
                  </Table>
                </div>
              )}
            </div>
            <div className="boname-page__table-footer">
              <p>
                Exibindo <strong>{filteredRecords.length > 0 ? pageStart + 1 : 0}</strong> a{' '}
                <strong>{filteredRecords.length > 0 ? pageStart + paginatedRecords.length : 0}</strong> de{' '}
                <strong>{filteredRecords.length}</strong> registros.
              </p>
              {filteredRecords.length > PAGE_SIZE ? (
                <Pagination
                  activePage={currentPage}
                  boundaryLinks
                  ellipsis
                  first
                  last
                  limit={PAGE_SIZE}
                  layout={['pager']}
                  maxButtons={5}
                  next
                  prev
                  size={isCompactLayout ? 'sm' : 'md'}
                  total={filteredRecords.length}
                  onChangePage={setActivePage}
                />
              ) : null}
            </div>
          </>
        )}
      </PageSection>

      <AppModal
        open={addPacienteModalOpen}
        backdrop="static"
        className="demandas-especificas-page__paciente-record-modal"
        footer={
          <>
            <Button appearance="subtle" disabled={saveDemandaMutation.isPending} onClick={handleCloseAddPacienteModal}>
              Fechar
            </Button>
            <Button appearance="primary" loading={saveDemandaMutation.isPending} onClick={() => void handleSaveDemanda()}>
              Salvar
            </Button>
          </>
        }
        intent={pacienteModalMode === 'edit' ? 'edit' : 'create'}
        intentVisible={false}
        onClose={handleCloseAddPacienteModal}
        size={isCompactLayout ? 'full' : 'lg'}
        subtitle={
          pacienteModalMode === 'edit'
            ? 'Atualize os dados do paciente vinculados a demanda especifica.'
            : 'Selecione o paciente que sera usado no cadastro da demanda especifica.'
        }
        title={pacienteModalMode === 'edit' ? 'Editar Paciente' : 'Adicionar Paciente'}
      >
        <div className="boname-page__modal-shell">
          <section className="boname-page__form-panel demandas-especificas-page__paciente-select-panel" aria-label="Selecionar paciente">
            <div className="medicamentos-page__form-section-header">
              <h3>Selecionar paciente</h3>
              <p>Use a pesquisa para localizar e selecionar um paciente do ambulatorio.</p>
            </div>
            <div className="boname-page__form-grid demandas-especificas-page__paciente-inline-grid">
              <div className="boname-page__field">
                <label htmlFor="demanda-paciente-numero">Num. paciente</label>
                <Input
                  id="demanda-paciente-numero"
                  className="boname-page__control"
                  value={selectedPaciente ? String(selectedPaciente.num_paciente) : ''}
                  onChange={(value) => setSelectedPaciente((current) => (current ? { ...current, num_paciente: Number(value || 0) } : null))}
                />
              </div>
              <div className="boname-page__field">
                <label>&nbsp;</label>
                <Button appearance="primary" startIcon={<SearchIcon />} onClick={handleOpenPatientLookupModal}>
                  Pesquisar
                </Button>
              </div>
              <div className="boname-page__field">
                <label htmlFor="demanda-paciente-nome">Paciente selecionado</label>
                <Input
                  id="demanda-paciente-nome"
                  className={demandaFormErrors.dem_pac_id ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={selectedPaciente ? formatText(selectedPaciente.nom_paciente) : ''}
                  readOnly
                />
                {demandaFormErrors.dem_pac_id ? <span className="boname-page__field-error">{demandaFormErrors.dem_pac_id}</span> : null}
              </div>
            </div>
            <div className="boname-page__form-grid">
              <div className="boname-page__field boname-page__field--full">
                <label htmlFor="demanda-medico-assistente">Medico assistente</label>
                <Input
                  id="demanda-medico-assistente"
                  className={demandaFormErrors.dem_medico_assis ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={demandaFormValues.dem_medico_assis}
                  onChange={(value) => {
                    setDemandaFormValues((current) => ({ ...current, dem_medico_assis: value }))
                    setDemandaFormErrors((current) => ({ ...current, dem_medico_assis: undefined }))
                  }}
                />
                {demandaFormErrors.dem_medico_assis ? <span className="boname-page__field-error">{demandaFormErrors.dem_medico_assis}</span> : null}
              </div>
              <div className="boname-page__field">
                <label htmlFor="demanda-medico-crm">CRM</label>
                <Input
                  id="demanda-medico-crm"
                  className={demandaFormErrors.dem_medico_crm ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={demandaFormValues.dem_medico_crm}
                  onChange={(value) => {
                    setDemandaFormValues((current) => ({ ...current, dem_medico_crm: value }))
                    setDemandaFormErrors((current) => ({ ...current, dem_medico_crm: undefined }))
                  }}
                />
                {demandaFormErrors.dem_medico_crm ? <span className="boname-page__field-error">{demandaFormErrors.dem_medico_crm}</span> : null}
              </div>
              <div className="boname-page__field">
                <label htmlFor="demanda-responsavel">Responsavel</label>
                <Input
                  id="demanda-responsavel"
                  className="boname-page__control"
                  value={demandaFormValues.dem_responsavel}
                  onChange={(value) => setDemandaFormValues((current) => ({ ...current, dem_responsavel: value }))}
                />
              </div>
              <div className="boname-page__field boname-page__field--full">
                <label htmlFor="demanda-diagnostico">Diagnostico</label>
                <SelectPicker
                  id="demanda-diagnostico"
                  block
                  cleanable={false}
                  data={diagnosticoOptions}
                  className={demandaFormErrors.dem_diag_id ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  loading={diagnosticosQuery.isFetching}
                  placeholder="Selecione o diagnostico"
                  value={demandaFormValues.dem_diag_id || null}
                  onChange={(value) => {
                    setDemandaFormValues((current) => ({ ...current, dem_diag_id: Number(value || 0) }))
                    setDemandaFormErrors((current) => ({ ...current, dem_diag_id: undefined }))
                  }}
                />
                {demandaFormErrors.dem_diag_id ? <span className="boname-page__field-error">{demandaFormErrors.dem_diag_id}</span> : null}
              </div>
            </div>
          </section>

        </div>
      </AppModal>

      <AppModal
        open={patientLookupModalOpen}
        backdrop="static"
        className="boname-page__record-modal demandas-especificas-page__record-modal demandas-especificas-page__patient-lookup-modal"
        footer={
          <Button appearance="subtle" onClick={() => setPatientLookupModalOpen(false)}>
            Fechar
          </Button>
        }
        intent="view"
        intentVisible={false}
        onClose={() => setPatientLookupModalOpen(false)}
        size={isCompactLayout ? 'full' : 'lg'}
        title="Pesquisar Paciente"
      >
        <div className="boname-page__modal-shell">
          <section className="boname-page__form-panel demandas-especificas-page__patient-lookup-panel" aria-label="Pesquisa de pacientes">
            <div className="demandas-especificas-page__patient-lookup-controls">
              <div className="demandas-especificas-page__patient-lookup-toolbar">
                <Input
                  aria-label="Pesquisar paciente"
                  className="boname-page__search-input demandas-especificas-page__patient-lookup-input"
                  placeholder="Nome, nome usual, CPF ou numero do paciente"
                  value={patientSearchValue}
                  onChange={setPatientSearchValue}
                  onPressEnter={handleSearchPatients}
                />
                <div className="demandas-especificas-page__patient-lookup-actions">
                  <Button
                    appearance="primary"
                    className="demandas-especificas-page__patient-lookup-button"
                    startIcon={<SearchIcon />}
                    onClick={handleSearchPatients}
                  >
                    Buscar
                  </Button>
                  <Button
                    appearance="ghost"
                    className="demandas-especificas-page__patient-lookup-button"
                    startIcon={<ReloadIcon />}
                    loading={pacientesLookupQuery.isFetching && !pacientesLookupQuery.isPending}
                    onClick={handleRefreshPatients}
                  >
                    Atualizar
                  </Button>
                </div>
              </div>
              <small className="demandas-especificas-page__patient-lookup-hint">Pressione Enter ou clique em Buscar para atualizar a listagem.</small>
            </div>

            {submittedPatientSearch === null ? (
              <DataState
                state="empty"
                title="Informe um filtro para iniciar"
                description="Digite um termo e clique em Buscar para consultar os pacientes."
              />
            ) : pacientesLookupQuery.isPending ? (
              <DataState
                state="loading"
                title="Carregando pacientes"
                description="Consultando os pacientes do ambulatorio."
              />
            ) : pacientesLookupQuery.isError ? (
              <DataState
                state="error"
                title="Falha ao carregar pacientes"
                description={
                  pacientesLookupQuery.error instanceof Error
                    ? pacientesLookupQuery.error.message
                    : 'Nao foi possivel consultar os pacientes.'
                }
                action={
                  <Button appearance="primary" startIcon={<ReloadIcon />} onClick={() => void pacientesLookupQuery.refetch()}>
                    Tentar novamente
                  </Button>
                }
              />
            ) : pacientesPesquisados.length === 0 ? (
              <DataState
                state="empty"
                title="Nenhum paciente encontrado"
                description="Ajuste o termo pesquisado e tente novamente."
              />
            ) : (
              <>
                <div className="boname-page__table-wrap demandas-especificas-page__patient-lookup-table-wrap demandas-especificas-page__modal-table-wrap">
                  <Table
                    key={patientLookupTableInstance}
                    data={paginatedPacientes}
                    height={patientLookupTableHeight}
                    fillHeight
                    bordered
                    rowHeight={54}
                    headerHeight={52}
                    autoHeight={false}
                  >
                    <Column width={104} align="center">
                      <HeaderCell>Codigo</HeaderCell>
                      <Cell dataKey="num_paciente" />
                    </Column>
                    <Column flexGrow={1.6} minWidth={260}>
                      <HeaderCell>Paciente</HeaderCell>
                      <Cell>{(rowData: PacienteLookupRecord) => formatText(rowData.nom_paciente)}</Cell>
                    </Column>
                    <Column flexGrow={1.2} minWidth={220}>
                      <HeaderCell>Nome usual</HeaderCell>
                      <Cell>{(rowData: PacienteLookupRecord) => formatText(rowData.nom_social)}</Cell>
                    </Column>
                    <Column width={140}>
                      <HeaderCell>Nascimento</HeaderCell>
                      <Cell>{(rowData: PacienteLookupRecord) => formatDateForDisplay(rowData.dt_nascimento)}</Cell>
                    </Column>
                    <Column width={150}>
                      <HeaderCell>CPF</HeaderCell>
                      <Cell>{(rowData: PacienteLookupRecord) => formatCpf(rowData.cpf)}</Cell>
                    </Column>
                    <Column width={120}>
                      <HeaderCell>Acao</HeaderCell>
                      <Cell>
                        {(rowData: PacienteLookupRecord) => (
                          <HStack justifyContent="center" className="boname-page__row-actions boname-page__row-actions--table">
                            <IconButton
                              appearance="subtle"
                              aria-label={`Selecionar paciente ${formatText(rowData.nom_paciente)}`}
                              circle
                              className="boname-page__action-icon boname-page__action-icon--view"
                              icon={<CheckIcon />}
                              size="xs"
                              onClick={() => handleSelectPaciente(rowData)}
                            />
                          </HStack>
                        )}
                      </Cell>
                    </Column>
                  </Table>
                </div>
                <div className="boname-page__table-footer">
                  <p>
                    Exibindo <strong>{patientLookupPageStart + 1}</strong> a{' '}
                    <strong>{Math.min(patientLookupPageStart + paginatedPacientes.length, pacientesPesquisados.length)}</strong> de{' '}
                    <strong>{pacientesPesquisados.length}</strong> pacientes.
                  </p>
                  {pacientesPesquisados.length > PAGE_SIZE ? (
                    <Pagination
                      activePage={currentPatientLookupPage}
                      boundaryLinks
                      ellipsis
                      first
                      last
                      limit={PAGE_SIZE}
                      layout={['pager']}
                      maxButtons={5}
                      next
                      prev
                      size={isCompactLayout ? 'sm' : 'md'}
                      total={pacientesPesquisados.length}
                      onChangePage={setPatientLookupPage}
                    />
                  ) : null}
                </div>
              </>
            )}
          </section>
        </div>
      </AppModal>

      <AppModal
        key={selectedDemanda ? `details-modal-${selectedDemanda.dem_id}` : 'details-modal-empty'}
        open={detailsModalOpen}
        backdrop="static"
        className={`${!itensQuery.isPending && !itensQuery.isError && selectedDemanda && itens.length === 0 ? 'demandas-especificas-page__record-modal demandas-especificas-page__record-modal--empty' : 'boname-page__record-modal demandas-especificas-page__record-modal'}`}
        footer={
          <>
            <Button appearance="subtle" disabled={saveItemMutation.isPending || toggleItemMutation.isPending} onClick={handleCloseDetails}>
              Fechar
            </Button>
          </>
        }
        intent="view"
        intentVisible={false}
        loading={detailsModalOpen && itensQuery.isPending}
        onClose={handleCloseDetails}
        size={isCompactLayout ? 'full' : 'lg'}
        subtitle="Visualize e mantenha os itens vinculados demanda selecionada."
        title={selectedDemanda ? `Itens da demanda ${selectedDemanda.dem_id}` : 'Itens da demanda'}
      >
        {itensQuery.isError ? (
          <DataState
            state="error"
            title="Falha ao carregar os itens"
            description={itensQuery.error instanceof Error ? itensQuery.error.message : 'Nao foi possivel carregar os itens da demanda especifica.'}
            action={
              <Button appearance="primary" onClick={() => void itensQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!itensQuery.isPending && !itensQuery.isError && selectedDemanda ? (
          <div className="boname-page__modal-shell demandas-especificas-page__details-shell">
            <div className="summary-grid demandas-especificas-page__details-summary">
              <SummaryCard accent="primary" hint="Paciente vinculado demanda." label="Paciente" value={formatText(selectedDemanda.nome_paciente)} />
            </div>

            {itens.length === 0 ? (
              <section className="boname-page__form-panel demandas-especificas-page__details-empty-panel" aria-label="Nenhum item da demanda">
                <DataState
                  state="empty"
                  title="Nenhum item encontrado"
                  description="A demanda selecionada ainda nao possui itens vinculados."
                />
              </section>
            ) : (
              <section className="boname-page__form-panel demandas-especificas-page__details-table-panel" aria-label="Itens da demanda especifica">
                <div className="medicamentos-page__form-section-header">
                  <h3>Itens vinculados</h3>
                  <p>Ative ou desative os medicamentos vinculados a esta demanda especifica.</p>
                </div>
                {isCompactLayout ? (
                  <div className="boname-page__card-list">
                    {paginatedItens.map((rowData) => (
                      <Panel bordered key={rowData.ite_id} className="boname-page__record-card">
                        <div className="boname-page__record-card-top">
                          <div>
                            <strong>{formatText(rowData.med_descr)}</strong>
                            <p>{formatText(rowData.med_descr_coml)}</p>
                          </div>
                          {renderItemStatus(rowData)}
                        </div>
                        <dl className="boname-page__record-meta">
                          <div>
                            <dt>Item</dt>
                            <dd>{formatText(rowData.ite_id)}</dd>
                          </div>
                          <div>
                            <dt>Qtde</dt>
                            <dd>{formatText(rowData.ite_dem_med_qtde)}</dd>
                          </div>
                          <div>
                            <dt>ID Medic.</dt>
                            <dd>{formatText(rowData.ite_dem_med_id)}</dd>
                          </div>
                        </dl>
                        {renderItemActions(rowData, true)}
                      </Panel>
                    ))}
                  </div>
                ) : (
                  <div className="boname-page__table-wrap demandas-especificas-page__modal-table-wrap">
                    <div className="demandas-especificas-page__modal-items-grid" role="table" aria-label="Itens vinculados">
                      <div className="demandas-especificas-page__modal-items-head" role="row">
                        <div role="columnheader">ID</div>
                        <div role="columnheader">Medicamento</div>
                        <div role="columnheader">Descricao Comercial</div>
                        <div role="columnheader">Qtde</div>
                        <div role="columnheader">Status</div>
                        <div role="columnheader">Acao</div>
                      </div>
                      <div className="demandas-especificas-page__modal-items-body" role="rowgroup">
                        {paginatedItens.map((rowData) => (
                          <div className="demandas-especificas-page__modal-items-row" role="row" key={rowData.ite_id}>
                            <div role="cell" className="demandas-especificas-page__modal-items-cell demandas-especificas-page__modal-items-cell--center">
                              {formatText(rowData.ite_id)}
                            </div>
                            <div role="cell" className="demandas-especificas-page__modal-items-cell">
                              {formatText(rowData.med_descr)}
                            </div>
                            <div role="cell" className="demandas-especificas-page__modal-items-cell">
                              {formatText(rowData.med_descr_coml)}
                            </div>
                            <div role="cell" className="demandas-especificas-page__modal-items-cell demandas-especificas-page__modal-items-cell--center">
                              {formatText(rowData.ite_dem_med_qtde)}
                            </div>
                            <div role="cell" className="demandas-especificas-page__modal-items-cell demandas-especificas-page__modal-items-cell--center">
                              {renderItemStatus(rowData)}
                            </div>
                            <div role="cell" className="demandas-especificas-page__modal-items-cell demandas-especificas-page__modal-items-cell--center">
                              {renderItemActions(rowData)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {itens.length > MODAL_PAGE_SIZE ? (
                  <div className="boname-page__table-footer">
                    <p>
                      Exibindo <strong>{modalPageStart + 1}</strong> a <strong>{Math.min(modalPageStart + paginatedItens.length, itens.length)}</strong> de{' '}
                      <strong>{itens.length}</strong> itens.
                    </p>
                    <Pagination
                      activePage={currentModalPage}
                      boundaryLinks
                      ellipsis
                      first
                      last
                      limit={MODAL_PAGE_SIZE}
                      layout={['pager']}
                      maxButtons={5}
                      next
                      prev
                      size={isCompactLayout ? 'sm' : 'md'}
                      total={itens.length}
                      onChangePage={setModalActivePage}
                    />
                  </div>
                ) : null}
              </section>
            )}
          </div>
        ) : null}
      </AppModal>

      <AppModal
        open={itemModalOpen}
        backdrop="static"
        className="boname-page__record-modal demandas-especificas-page__record-modal demandas-especificas-page__item-record-modal"
        footer={
          <>
            <Button appearance="subtle" disabled={saveItemMutation.isPending} onClick={handleCloseItemModal}>
              Cancelar
            </Button>
            <Button appearance="primary" loading={saveItemMutation.isPending} onClick={() => void handleSaveItem()}>
              Salvar
            </Button>
          </>
        }
        intent={editingItem ? 'edit' : 'create'}
        intentVisible={false}
        onClose={handleCloseItemModal}
        size={isCompactLayout ? 'full' : 'sm'}
        subtitle={
          selectedDemanda
            ? `Demanda ${selectedDemanda.dem_id} de ${formatText(selectedDemanda.nome_paciente)}.`
            : selectedPaciente
              ? `Paciente ${formatText(selectedPaciente.nom_paciente)}.`
              : 'Preencha os dados do item selecionado.'
        }
        title={editingItem ? 'Editar item da demanda' : 'Adicionar item da demanda'}
      >
        <div className="boname-page__modal-shell">
          <section className="boname-page__form-panel demandas-especificas-page__item-form-panel" aria-label="Formulario de item da demanda especifica">
            <div className="medicamentos-page__form-section-header">
              <h3>Dados do item</h3>
              <p>Selecione o medicamento e informe a quantidade vinculada demanda especifica.</p>
            </div>
            <div className="boname-page__form-grid demandas-especificas-page__item-form-grid">
              <div className="boname-page__field boname-page__field--full">
                <label htmlFor="demanda-item-medicamento">Medicamento</label>
                <SelectPicker
                  id="demanda-item-medicamento"
                  block
                  cleanable={false}
                  data={medicamentoOptions}
                  className={itemFormErrors.dem_med_id ? 'boname-page__control demandas-especificas-page__item-control boname-page__control--error' : 'boname-page__control demandas-especificas-page__item-control'}
                  loading={medicamentosQuery.isFetching}
                  placeholder="Selecione o medicamento"
                  value={itemFormValues.dem_med_id || null}
                  onChange={(value) => {
                    setItemFormValues((current) => ({ ...current, dem_med_id: Number(value || 0) }))
                    setItemFormErrors((current) => ({ ...current, dem_med_id: undefined }))
                  }}
                />
                {itemFormErrors.dem_med_id ? <span className="boname-page__field-error">{itemFormErrors.dem_med_id}</span> : null}
              </div>
              <div className="boname-page__field boname-page__field--full">
                <label htmlFor="demanda-item-medicamento-label">Descricao selecionada</label>
                <Input
                  id="demanda-item-medicamento-label"
                  className="boname-page__control demandas-especificas-page__item-control demandas-especificas-page__item-control--readonly"
                  readOnly
                  value={selectedMedicamentoLabel}
                />
              </div>
              <div className="boname-page__field boname-page__field--full">
                <label htmlFor="demanda-item-quantidade">Quantidade</label>
                <InputNumber
                  id="demanda-item-quantidade"
                  min={1}
                  className={itemFormErrors.dem_med_qtde ? 'boname-page__control demandas-especificas-page__item-control boname-page__control--error' : 'boname-page__control demandas-especificas-page__item-control'}
                  controls
                  value={itemFormValues.dem_med_qtde || null}
                  onChange={(value) => {
                    setItemFormValues((current) => ({ ...current, dem_med_qtde: Number(value || 0) }))
                    setItemFormErrors((current) => ({ ...current, dem_med_qtde: undefined }))
                  }}
                />
                {itemFormErrors.dem_med_qtde ? <span className="boname-page__field-error">{itemFormErrors.dem_med_qtde}</span> : null}
              </div>
            </div>
          </section>
        </div>
      </AppModal>
    </section>
  )
}
