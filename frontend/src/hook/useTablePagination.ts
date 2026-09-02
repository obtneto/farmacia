import { useState } from 'react'
import type { TableProps, TableRow } from '../components/Table'

export interface UseTablePaginationOptions {
  initialLimit?: number
  initialPage?: number
}

export interface UseTablePaginationResult<T extends TableRow> {
  activePage: number
  endIndex: number
  limit: number
  onChangeLimit: (nextLimit: number) => void
  onChangePage: (nextPage: number) => void
  paginatedData: T[]
  resetPage: () => void
  startIndex: number
  tableData: TableProps<T>['data']
  total: number
  totalPages: number
}

function normalizePositiveInteger(value: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback
  }

  const normalized = Math.floor(value)
  return normalized > 0 ? normalized : fallback
}

function clampPage(page: number, totalPages: number) {
  return Math.min(Math.max(normalizePositiveInteger(page, 1), 1), totalPages)
}

export function useTablePagination<T extends TableRow>(
  data: T[],
  options: UseTablePaginationOptions = {},
): UseTablePaginationResult<T> {
  const initialLimit = normalizePositiveInteger(options.initialLimit ?? 10, 10)
  const initialPage = normalizePositiveInteger(options.initialPage ?? 1, 1)
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  const total = data.length
  const totalPages = Math.max(Math.ceil(total / limit), 1)
  const activePage = clampPage(page, totalPages)
  const startIndex = (activePage - 1) * limit
  const endIndex = startIndex + limit
  const paginatedData = data.slice(startIndex, endIndex)

  function onChangePage(nextPage: number) {
    setPage(clampPage(nextPage, totalPages))
  }

  function onChangeLimit(nextLimit: number) {
    const normalizedLimit = normalizePositiveInteger(nextLimit, initialLimit)
    setLimit(normalizedLimit)
    setPage(1)
  }

  function resetPage() {
    setPage(1)
  }

  return {
    activePage,
    endIndex,
    limit,
    onChangeLimit,
    onChangePage,
    paginatedData,
    resetPage,
    startIndex,
    tableData: paginatedData,
    total,
    totalPages,
  }
}

export default useTablePagination
