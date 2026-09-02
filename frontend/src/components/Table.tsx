import type { ReactNode, TableHTMLAttributes } from 'react'
import './Table.css'

export type TableRow = object

export interface TableColumn<T extends TableRow = TableRow> {
  align?: 'center' | 'left' | 'right'
  header: ReactNode
  id?: string
  key: keyof T & string
  render?: (row: T, rowIndex: number) => ReactNode
  size?: 'actions' | 'fluid' | 'lg' | 'md' | 'sm' | 'xs'
}

export interface TableProps<T extends TableRow = TableRow> extends Omit<TableHTMLAttributes<HTMLTableElement>, 'children'> {
  columns: TableColumn<T>[]
  data: T[]
  emptyMessage?: ReactNode
  rowKey?: (keyof T & string) | ((row: T, rowIndex: number) => string | number)
}

function getCellClassName<T extends TableRow>(column: TableColumn<T>) {
  return [
    column.align ? `app-table__cell--${column.align}` : '',
    column.size ? `app-table__cell--${column.size}` : '',
  ].filter(Boolean).join(' ') || undefined
}

function getRowKey<T extends TableRow>(row: T, rowIndex: number, rowKey?: TableProps<T>['rowKey']) {
  if (typeof rowKey === 'function') {
    return rowKey(row, rowIndex)
  }

  if (rowKey && typeof row[rowKey] === 'string') {
    return row[rowKey]
  }

  if (rowKey && typeof row[rowKey] === 'number') {
    return row[rowKey]
  }

  return rowIndex
}


function renderCellValue(value: unknown): ReactNode {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value === 'boolean') {
    return value ? true : false
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }

  if (value instanceof Date) {
    return value.toLocaleDateString('pt-BR')
  }

  return null
}

export function Table<T extends TableRow>({
  className = '',
  columns,
  data,
  emptyMessage = 'Nenhum registro encontrado.',
  rowKey,
  ...tableProps
}: TableProps<T>) {
  const tableClassName = `app-table ${className}`.trim()

  return (
    <div className="app-table__container">
      <table className={tableClassName} {...tableProps}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.id ?? column.key} className={getCellClassName(column)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={getRowKey(row, rowIndex, rowKey)}>
                {columns.map((column) => (
                  <td key={column.id ?? column.key} className={getCellClassName(column)}>
                    {column.render ? column.render(row, rowIndex) : renderCellValue(row[column.key])}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="app-table__empty" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
