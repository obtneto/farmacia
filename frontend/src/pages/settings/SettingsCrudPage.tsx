import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, HStack, IconButton, Input, Pagination, Panel, SelectPicker, Textarea, Tooltip, useMediaQuery, Whisper } from 'rsuite'
import { Cell, Column, HeaderCell, Table } from '../../components/Table'
import SearchIcon from '@rsuite/icons/Search'
import ReloadIcon from '@rsuite/icons/Reload'
import PlusIcon from '@rsuite/icons/Plus'
import EditIcon from '@rsuite/icons/Edit'
import TrashIcon from '@rsuite/icons/Trash'
import VisibleIcon from '@rsuite/icons/Visible'
import { AppModal, DataState, PageSection, StatusBadge } from '../../components/ui'
import { apiRequest } from '../../lib/api'
import { getErrorMessage, useMessage } from '../../hooks/useMessage'
import '../boname/BonameCrudPage.css'

type SettingPrimitiveValue = string | number | boolean | null
type SettingSelectOption = {
  name: string
  value: string
}
type SettingValue = SettingPrimitiveValue | SettingSelectOption[]
type SettingValueType = 'string' | 'number' | 'boolean' | 'null' | 'options'
type FormMode = 'create' | 'edit' | 'view'

export interface SettingRecord {
  key: string
  type: SettingValueType
  value: SettingValue
  valuePreview: string
}

interface SettingsResponse {
  settings: Record<string, SettingValue>
}

interface SettingFormValues {
  key: string
  type: SettingValueType
  value: string
}

type FormErrors = Partial<Record<keyof SettingFormValues, string>>

export interface SettingsCrudPageProps {
  pageSize?: number
}

const DEFAULT_FORM_VALUES: SettingFormValues = {
  key: '',
  type: 'string',
  value: '',
}

const PAGE_SIZE = 13
const SETTING_KEY_MAX_LENGTH = 80
const SETTING_VALUE_MAX_LENGTH = 4000
const SETTING_TYPE_OPTIONS: Array<{ label: string; value: SettingValueType }> = [
  { label: 'TEXTO', value: 'string' },
  { label: 'NUMERO', value: 'number' },
  { label: 'BOOLEANO', value: 'boolean' },
  { label: 'NULO', value: 'null' },
  { label: 'LISTA JSON', value: 'options' },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function resolveSettingType(value: SettingValue): SettingValueType {
  if (Array.isArray(value)) {
    return 'options'
  }

  if (value === null) {
    return 'null'
  }

  if (typeof value === 'number') {
    return 'number'
  }

  if (typeof value === 'boolean') {
    return 'boolean'
  }

  return 'string'
}

function formatSettingValue(value: SettingValue): string {
  if (Array.isArray(value)) {
    return JSON.stringify(value, null, 2)
  }

  if (value === null) {
    return 'null'
  }

  return String(value)
}

function formatSettingPreview(value: SettingValue): string {
  if (Array.isArray(value)) {
    return `${value.length} opcao${value.length === 1 ? '' : 'es'}`
  }

  if (value === null) {
    return 'null'
  }

  return String(value)
}

function normalizeKey(value: string): string {
  return value.trim().slice(0, SETTING_KEY_MAX_LENGTH)
}

function normalizeValue(value: string): string {
  return value.slice(0, SETTING_VALUE_MAX_LENGTH)
}

function normalizeSearchTerm(value: string): string {
  return value.trim().toLocaleLowerCase('pt-BR')
}

function mapSettingsToRecords(settings: Record<string, SettingValue>): SettingRecord[] {
  return Object.entries(settings)
    .map(([key, value]) => ({
      key,
      type: resolveSettingType(value),
      value,
      valuePreview: formatSettingPreview(value),
    }))
    .toSorted((left, right) => left.key.localeCompare(right.key, 'pt-BR'))
}

function buildFormValues(record: SettingRecord): SettingFormValues {
  return {
    key: record.key,
    type: record.type,
    value: formatSettingValue(record.value),
  }
}

function parseSelectOptions(value: string): SettingSelectOption[] {
  let parsedValue: unknown

  try {
    parsedValue = JSON.parse(value)
  } catch {
    const error = new Error('Informe uma lista JSON válida.')
    error.name = 'ValidationError'
    throw error
  }

  if (!Array.isArray(parsedValue)) {
    const error = new Error('O valor deve ser uma lista JSON.')
    error.name = 'ValidationError'
    throw error
  }

  return parsedValue.map((item) => {
    if (!isRecord(item)) {
      const error = new Error('Cada item da lista deve ter name e value.')
      error.name = 'ValidationError'
      throw error
    }

    const name = String(item.name || '').trim()
    const optionValue = String(item.value || '').trim()

    if (!name || !optionValue) {
      const error = new Error('Cada item da lista deve ter name e value.')
      error.name = 'ValidationError'
      throw error
    }

    return { name, value: optionValue }
  })
}

function parseSettingValue(values: SettingFormValues): SettingValue {
  if (values.type === 'null') {
    return null
  }

  if (values.type === 'number') {
    const numericValue = Number(values.value)

    if (!Number.isFinite(numericValue)) {
      const error = new Error('Informe um número válido.')
      error.name = 'ValidationError'
      throw error
    }

    return numericValue
  }

  if (values.type === 'boolean') {
    const normalizedValue = values.value.trim().toLocaleLowerCase('pt-BR')

    if (['true', '1', 'sim'].includes(normalizedValue)) {
      return true
    }

    if (['false', '0', 'nao', 'não'].includes(normalizedValue)) {
      return false
    }

    const error = new Error('Informe true/false, sim/não ou 1/0.')
    error.name = 'ValidationError'
    throw error
  }

  if (values.type === 'options') {
    return parseSelectOptions(values.value)
  }

  return values.value.trim()
}

function validateForm(values: SettingFormValues): FormErrors {
  const errors: FormErrors = {}

  if (!values.key.trim()) {
    errors.key = 'Informe a chave da configuração.'
  }

  if (values.type !== 'null' && !values.value.trim()) {
    errors.value = 'Informe o valor da configuração.'
  }

  return errors
}

async function listarSettings(): Promise<SettingRecord[]> {
  const payload = await apiRequest<SettingsResponse>('/settings')
  return mapSettingsToRecords(payload.settings)
}

async function salvarSetting(values: SettingFormValues): Promise<void> {
  await apiRequest('/settings/salvar', {
    method: 'POST',
    body: JSON.stringify({
      key: normalizeKey(values.key),
      value: parseSettingValue(values),
    }),
  })
}

async function excluirSetting(key: string): Promise<void> {
  await apiRequest(`/settings/excluir/${encodeURIComponent(key)}`, { method: 'DELETE' })
}

export function SettingsCrudPage({ pageSize = PAGE_SIZE }: SettingsCrudPageProps) {
  const [isCompactLayout] = useMediaQuery('(max-width: 768px)')
  const message = useMessage()
  const queryClient = useQueryClient()
  const [searchValue, setSearchValue] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [activePage, setActivePage] = useState(1)
  const [modalMode, setModalMode] = useState<FormMode | null>(null)
  const [formValues, setFormValues] = useState<SettingFormValues>(DEFAULT_FORM_VALUES)
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const listQuery = useQuery({
    queryKey: ['settings-list'],
    queryFn: listarSettings,
  })

  const saveMutation = useMutation({
    mutationFn: salvarSetting,
    onSuccess: async () => {
      message.success('Configuração salva', 'Registro atualizado com sucesso.')
      setModalMode(null)
      setFormValues(DEFAULT_FORM_VALUES)
      await queryClient.invalidateQueries({ queryKey: ['settings-list'] })
    },
    onError: (error: Error) => {
      message.error('Erro ao salvar configuração', getErrorMessage(error))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: excluirSetting,
    onSuccess: async () => {
      message.success('Configuração excluída', 'Registro removido com sucesso.')
      await queryClient.invalidateQueries({ queryKey: ['settings-list'] })
    },
    onError: (error: Error) => {
      message.error('Erro ao excluir configuração', getErrorMessage(error))
    },
  })

  const normalizedSearch = normalizeSearchTerm(submittedSearch)
  const records = (listQuery.data ?? []).filter((record) => {
    if (!normalizedSearch) {
      return true
    }

    return (
      record.key.toLocaleLowerCase('pt-BR').includes(normalizedSearch)
      || record.valuePreview.toLocaleLowerCase('pt-BR').includes(normalizedSearch)
    )
  })
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize))
  const currentPage = Math.min(activePage, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const paginatedRecords = records.slice(pageStart, pageStart + pageSize)
  const hasData = records.length > 0
  const isReadOnly = modalMode === 'view'

  const handleSearch = () => {
    setSubmittedSearch(searchValue)
    setActivePage(1)
  }

  const closeFormModal = () => {
    setModalMode(null)
    setFormValues(DEFAULT_FORM_VALUES)
    setFormErrors({})
  }

  const handleOpenCreate = () => {
    setModalMode('create')
    setFormValues(DEFAULT_FORM_VALUES)
    setFormErrors({})
  }

  const handleOpenRecordModal = (mode: 'edit' | 'view', record: SettingRecord) => {
    setModalMode(mode)
    setFormValues(buildFormValues(record))
    setFormErrors({})
  }

  const handleSubmit = async () => {
    const nextErrors = validateForm(formValues)
    setFormErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      await message.message({
        icon: 'warning',
        title: 'Campos obrigatórios',
        text: 'Revise os campos destacados antes de salvar o registro.',
      })
      return
    }

    try {
      await saveMutation.mutateAsync(formValues)
    } catch {
      // The mutation onError callback already surfaces the failure to the user.
    }
  }

  const handleRequestDelete = async (record: SettingRecord) => {
    await message.confirmDestructive({
      description: 'Esta ação remove a configuração de forma permanente.',
      highlightedDescription: record.key,
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(record.key)
        } catch {
          // The mutation onError callback already surfaces the failure to the user.
        }
      },
      subtitle: 'A ação abaixo afeta diretamente a configuração selecionada.',
      title: 'Confirmar exclusão',
    })
  }

  const tableLabelStart = hasData ? pageStart + 1 : 0
  const tableLabelEnd = hasData ? pageStart + paginatedRecords.length : 0

  const renderRowActions = (rowData: SettingRecord, compact = false) => (
    <HStack
      spacing={8}
      wrap={compact}
      className={`boname-page__row-actions ${compact ? 'boname-page__row-actions--compact' : 'boname-page__row-actions--table'}`.trim()}
    >
      {compact ? (
        <Button appearance="subtle" size="xs" startIcon={<VisibleIcon />} onClick={() => handleOpenRecordModal('view', rowData)}>
          Visualizar
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`settings-view-${rowData.key}`} speaker={<Tooltip>Visualizar</Tooltip>}>
          <IconButton appearance="subtle" size="xs" aria-label="Visualizar registro" circle className="boname-page__action-icon boname-page__action-icon--view" icon={<VisibleIcon />} onClick={() => handleOpenRecordModal('view', rowData)} />
        </Whisper>
      )}
      {compact ? (
        <Button appearance="subtle" size="xs" startIcon={<EditIcon />} onClick={() => handleOpenRecordModal('edit', rowData)}>
          Editar
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`settings-edit-${rowData.key}`} speaker={<Tooltip>Editar</Tooltip>}>
          <IconButton appearance="subtle" size="xs" aria-label="Editar registro" circle className="boname-page__action-icon boname-page__action-icon--edit" icon={<EditIcon />} onClick={() => handleOpenRecordModal('edit', rowData)} />
        </Whisper>
      )}
      {compact ? (
        <Button appearance="subtle" color="red" size="xs" startIcon={<TrashIcon />} onClick={() => { void handleRequestDelete(rowData) }}>
          Excluir
        </Button>
      ) : (
        <Whisper placement="top" trigger={['hover', 'focus']} controlId={`settings-delete-${rowData.key}`} speaker={<Tooltip>Excluir</Tooltip>}>
          <IconButton appearance="subtle" color="red" size="xs" aria-label="Excluir registro" circle className="boname-page__action-icon boname-page__action-icon--delete" icon={<TrashIcon />} onClick={() => { void handleRequestDelete(rowData) }} />
        </Whisper>
      )}
    </HStack>
  )

  return (
    <section className="boname-page settings-page">
      <PageSection
        className="boname-page__table-section"
        actions={
          <div className="boname-page__toolbar">
            <Input
              aria-label="Buscar configuração"
              className="boname-page__search-input"
              placeholder="Buscar por chave ou valor"
              value={searchValue}
              onChange={setSearchValue}
              onPressEnter={handleSearch}
            />
            <HStack spacing={10} wrap className="boname-page__toolbar-actions">
              <Button appearance="primary" startIcon={<SearchIcon />} onClick={handleSearch}>
                Buscar
              </Button>
              <Button
                appearance="ghost"
                startIcon={<ReloadIcon />}
                loading={listQuery.isFetching && !listQuery.isPending}
                onClick={() => {
                  void listQuery.refetch()
                }}
              >
                Atualizar
              </Button>
              <Button appearance="primary" color="green" startIcon={<PlusIcon />} onClick={handleOpenCreate}>
                Nova Configuração
              </Button>
            </HStack>
          </div>
        }
      >
        {listQuery.isPending ? (
          <DataState
            state="loading"
            title="Carregando Settings..."
            description="Consultando o endpoint `GET /settings`."
          />
        ) : null}

        {listQuery.isError ? (
          <DataState
            state="error"
            title="Não foi possível listar os registros"
            description={listQuery.error instanceof Error ? listQuery.error.message : 'Erro ao listar settings.'}
            action={
              <Button appearance="primary" onClick={() => void listQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!listQuery.isPending && !listQuery.isError && !hasData ? (
          <DataState
            state="empty"
            title="Nenhuma configuração encontrada"
            description="Cadastre uma configuração para preencher a tabela."
            action={
              <Button appearance="primary" onClick={handleOpenCreate}>
                Cadastrar configuração
              </Button>
            }
          />
        ) : null}

        {!listQuery.isPending && !listQuery.isError && hasData ? (
          <>
            <div className="boname-page__table-content">
              {isCompactLayout ? (
                <div className="boname-page__card-list">
                  {paginatedRecords.map((rowData) => (
                    <Panel bordered key={rowData.key} className="boname-page__record-card">
                      <div className="boname-page__record-card-top">
                        <div>
                          <strong>{rowData.key}</strong>
                        </div>
                        <StatusBadge tone="info">{rowData.type}</StatusBadge>
                      </div>

                      <dl className="boname-page__record-meta">
                        <div>
                          <dt>Valor</dt>
                          <dd>{rowData.valuePreview}</dd>
                        </div>
                      </dl>

                      {renderRowActions(rowData, true)}
                    </Panel>
                  ))}
                </div>
              ) : (
                <div className="boname-page__table-wrap">
                  <Table
                    data={paginatedRecords}
                    fillHeight
                    virtualized
                    bordered
                    rowHeight={54}
                    headerHeight={52}
                    autoHeight={false}
                  >
                    <Column width={240} fixed>
                      <HeaderCell>Chave</HeaderCell>
                      <Cell dataKey="key" />
                    </Column>

                    <Column width={112} align="center">
                      <HeaderCell>Tipo</HeaderCell>
                      <Cell>
                        {(rowData: SettingRecord) => <StatusBadge tone="info">{rowData.type}</StatusBadge>}
                      </Cell>
                    </Column>

                    <Column flexGrow={1} minWidth={280}>
                      <HeaderCell>Valor</HeaderCell>
                      <Cell dataKey="valuePreview" />
                    </Column>

                    <Column width={132} fixed="right">
                      <HeaderCell>Ações</HeaderCell>
                      <Cell>{(rowData: SettingRecord) => renderRowActions(rowData)}</Cell>
                    </Column>
                  </Table>
                </div>
              )}
            </div>

            <div className="boname-page__table-footer">
              <p>
                Exibindo <strong>{tableLabelStart}</strong> a <strong>{tableLabelEnd}</strong> de{' '}
                <strong>{records.length}</strong> registros.
              </p>
              <Pagination
                activePage={currentPage}
                boundaryLinks
                ellipsis
                first
                last
                limit={pageSize}
                layout={['pager']}
                maxButtons={5}
                next
                prev
                size={isCompactLayout ? 'sm' : 'md'}
                total={records.length}
                onChangePage={setActivePage}
              />
            </div>
          </>
        ) : null}
      </PageSection>

      <AppModal
        open={modalMode !== null}
        backdrop="static"
        intent={modalMode === 'create' ? 'create' : modalMode === 'edit' ? 'edit' : 'view'}
        title={
          modalMode === 'create'
            ? 'Nova Configuração'
            : modalMode === 'edit'
              ? 'Editar Configuração'
              : 'Visualizar Configuração'
        }
        subtitle={
          modalMode === 'view'
            ? 'Consulta em modo leitura da configuração selecionada.'
            : 'Preencha os dados da configuração e confirme a gravação.'
        }
        intentVisible={false}
        className="boname-page__record-modal"
        onClose={closeFormModal}
        size={isCompactLayout ? 'full' : 'md'}
        footer={
          modalMode === 'view' ? (
            <Button appearance="primary" onClick={closeFormModal}>
              Fechar
            </Button>
          ) : (
            <>
              <Button appearance="subtle" onClick={closeFormModal}>
                Cancelar
              </Button>
              <Button appearance="primary" loading={saveMutation.isPending} onClick={() => void handleSubmit()}>
                Salvar
              </Button>
            </>
          )
        }
      >
        <div className="boname-page__modal-shell">
          <section className="boname-page__form-panel" aria-label="Formulário de settings">
            <div className="boname-page__form-grid">
              <div className="boname-page__field">
                <label htmlFor="setting-key">Chave</label>
                <Input
                  id="setting-key"
                  maxLength={SETTING_KEY_MAX_LENGTH}
                  className={formErrors.key ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={formValues.key}
                  disabled={isReadOnly || modalMode === 'edit'}
                  onChange={(value) => {
                    setFormValues((current) => ({ ...current, key: normalizeKey(value) }))
                  }}
                />
                {formErrors.key ? <span role="alert">{formErrors.key}</span> : null}
              </div>

              <div className="boname-page__field">
                <label htmlFor="setting-type">Tipo</label>
                <SelectPicker
                  id="setting-type"
                  aria-labelledby="setting-type-label"
                  cleanable={false}
                  searchable={false}
                  block
                  data={SETTING_TYPE_OPTIONS}
                  className={formErrors.type ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={formValues.type}
                  disabled={isReadOnly}
                  onChange={(value) => {
                    setFormValues((current) => ({ ...current, type: value ?? 'string' }))
                  }}
                />
                {formErrors.type ? <span role="alert">{formErrors.type}</span> : null}
              </div>

              <div className="boname-page__field boname-page__field--full">
                <label htmlFor="setting-value">Valor</label>
                <Textarea
                  id="setting-value"
                  rows={8}
                  maxLength={SETTING_VALUE_MAX_LENGTH}
                  className={formErrors.value ? 'boname-page__control boname-page__control--error' : 'boname-page__control'}
                  value={formValues.value}
                  disabled={isReadOnly || formValues.type === 'null'}
                  onChange={(value) => {
                    setFormValues((current) => ({ ...current, value: normalizeValue(value) }))
                  }}
                />
                {formErrors.value ? <span role="alert">{formErrors.value}</span> : null}
              </div>
            </div>
          </section>
        </div>
      </AppModal>
    </section>
  )
}

export default SettingsCrudPage
