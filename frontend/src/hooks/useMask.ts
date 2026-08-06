type MaskValue = Date | number | string | null | undefined

export function maskText(value: MaskValue): string {
  if (value === null || value === undefined) {
    return '-'
  }

  const normalized = String(value).trim()
  return normalized ? normalized : '-'
}

export function maskOnlyDigits(value: MaskValue): string {
  return String(value ?? '').replace(/\D/g, '')
}

export function maskAlphanumeric(value: MaskValue): string {
  return String(value ?? '').replace(/[^a-zA-Z0-9]/g, '').toLocaleUpperCase('pt-BR')
}

export function maskDate(value: Date | string | null | undefined): string {
  if (!value) {
    return '-'
  }

  const parsedDate = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return '-'
  }

  return parsedDate.toLocaleDateString('pt-BR')
}

export function maskNumber(value: number | string | null | undefined): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Number(value || 0))
}

export function maskCpf(value: string | null | undefined): string {
  const digits = maskOnlyDigits(value)

  if (!digits) {
    return '-'
  }

  if (digits.length !== 11) {
    return maskText(value)
  }

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function maskDocumentRequisition(value: MaskValue): string {
  const normalized = maskAlphanumeric(value).slice(0, 11)

  if (!normalized) {
    return ''
  }

  const first = normalized.slice(0, 3)
  const second = normalized.slice(3, 7)
  const third = normalized.slice(7, 11)

  return [first, second, third].filter(Boolean).join('-')
}

export function useMask() {
  return {
    alphanumeric: maskAlphanumeric,
    cpf: maskCpf,
    date: maskDate,
    documentNumber: maskDocumentRequisition,
    documentRequisition: maskDocumentRequisition,
    number: maskNumber,
    onlyDigits: maskOnlyDigits,
    requisitionNumber: maskDocumentRequisition,
    text: maskText,
  }
}
