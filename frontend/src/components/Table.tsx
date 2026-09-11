import { Children, isValidElement, type CSSProperties, type ReactNode, type TableHTMLAttributes } from 'react'
import './Table.css'

export type TableRow = object
type ColumnAlign = 'center' | 'left' | 'right'
type FixedPosition = boolean | 'left' | 'right'

export interface TableColumn<T extends TableRow = TableRow> {
  align?: ColumnAlign
  cellClassName?: string
  cellStyle?: CSSProperties
  className?: string
  flexGrow?: number
  header: ReactNode
  headerClassName?: string
  id?: string
  key: string
  minWidth?: number | string
  render?: (row: T, rowIndex: number) => ReactNode
  size?: 'actions' | 'fluid' | 'lg' | 'md' | 'sm' | 'xs'
  width?: number | string
}

export interface TableProps<T extends TableRow = TableRow> extends Omit<TableHTMLAttributes<HTMLTableElement>, 'children'> {
  autoHeight?: boolean
  bordered?: boolean
  children?: ReactNode
  columns?: TableColumn<T>[]
  data?: T[]
  emptyMessage?: ReactNode
  fillHeight?: boolean
  headerHeight?: number
  height?: number
  hover?: boolean
  rowKey?: (keyof T & string) | ((row: T, rowIndex: number) => string | number)
  rowHeight?: number
  virtualized?: boolean
  width?: number
  wordWrap?: boolean
}

export interface ColumnProps {
  align?: ColumnAlign
  children?: ReactNode
  className?: string
  fixed?: FixedPosition
  flexGrow?: number
  minWidth?: number
  verticalAlign?: string
  width?: number
}

export interface HeaderCellProps {
  children?: ReactNode
  className?: string
}

export interface CellProps<T extends TableRow = TableRow> {
  children?: ((rowData: T, rowIndex: number) => ReactNode) | ReactNode
  className?: string
  dataKey?: keyof T & string
  style?: CSSProperties
}

function getCellClassName<T extends TableRow>(column: TableColumn<T>) {
  return [
    column.className ?? '',
    column.align ? `app-table__cell--${column.align}` : '',
    column.size ? `app-table__cell--${column.size}` : '',
  ].filter(Boolean).join(' ') || undefined
}

function getHeaderClassName<T extends TableRow>(column: TableColumn<T>) {
  return [
    getCellClassName(column),
    column.headerClassName ?? '',
  ].filter(Boolean).join(' ') || undefined
}

function getBodyCellClassName<T extends TableRow>(column: TableColumn<T>) {
  return [
    getCellClassName(column),
    column.cellClassName ?? '',
  ].filter(Boolean).join(' ') || undefined
}

function getCellStyle<T extends TableRow>(column: TableColumn<T>): CSSProperties | undefined {
  const style: CSSProperties = {}

  if (column.width !== undefined) {
    style.flexBasis = typeof column.width === 'number' ? `${column.width}px` : column.width
  }

  if (column.flexGrow !== undefined) {
    style.flexGrow = column.flexGrow
  }

  if (column.minWidth !== undefined) {
    style.minWidth = typeof column.minWidth === 'number' ? `${column.minWidth}px` : column.minWidth
  }

  return Object.keys(style).length > 0 ? style : undefined
}

function getBodyCellStyle<T extends TableRow>(column: TableColumn<T>): CSSProperties | undefined {
  const columnStyle = getCellStyle(column)

  if (!column.cellStyle) {
    return columnStyle
  }

  return {
    ...columnStyle,
    ...column.cellStyle,
  }
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

function getColumnKey(index: number, cellProps?: CellProps) {
  return cellProps?.dataKey ?? `column_${index}`
}

function getColumnSize(columnProps: ColumnProps): TableColumn['size'] | undefined {
  if (columnProps.fixed === 'right') {
    return 'actions'
  }

  if (!columnProps.width) {
    return 'fluid'
  }

  if (columnProps.width <= 80) {
    return 'xs'
  }

  if (columnProps.width <= 120) {
    return 'sm'
  }

  if (columnProps.width <= 170) {
    return 'md'
  }

  return 'lg'
}

function getColumnNodes(children: ReactNode) {
  return Children.toArray(children).filter(isValidElement<ColumnProps>)
}

function readColumnCells(children: ReactNode) {
  let header: ReactNode = null
  let headerClassName: string | undefined
  let cellProps: CellProps<TableRow> | undefined

  Children.forEach(children, (child) => {
    if (isValidElement<HeaderCellProps>(child) && child.type === HeaderCell) {
      header = child.props.children
      headerClassName = child.props.className
      return
    }

    if (isValidElement<CellProps<TableRow>>(child) && child.type === Cell) {
      cellProps = child.props
    }
  })

  return { cellProps, header, headerClassName }
}

function buildColumns<T extends TableRow>(children: ReactNode): TableColumn<T>[] {
  return getColumnNodes(children).map((column, index) => {
    const columnProps = column.props
    const { cellProps, header, headerClassName } = readColumnCells(columnProps.children)
    const key = getColumnKey(index, cellProps)
    const cellRenderer = cellProps?.children
    const render = typeof cellRenderer === 'function'
      ? (rowData: T, rowIndex: number) => cellRenderer(rowData, rowIndex)
      : undefined

    return {
      align: columnProps.align,
      cellClassName: cellProps?.className,
      cellStyle: cellProps?.style,
      className: columnProps.className,
      flexGrow: columnProps.flexGrow,
      header,
      headerClassName,
      id: `${key}-${index}`,
      key,
      minWidth: columnProps.minWidth,
      render,
      size: getColumnSize(columnProps),
      width: columnProps.width,
    }
  })
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
  autoHeight: _autoHeight,
  bordered: _bordered,
  children,
  className = '',
  columns,
  data = [],
  emptyMessage = 'Nenhum registro encontrado.',
  fillHeight: _fillHeight,
  headerHeight: _headerHeight,
  height,
  hover: _hover,
  rowKey,
  rowHeight: _rowHeight,
  style,
  virtualized: _virtualized,
  width,
  wordWrap = false,
  ...tableProps
}: TableProps<T>) {
  void _autoHeight
  void _bordered
  void _fillHeight
  void _headerHeight
  void _hover
  void _rowHeight
  void _virtualized

  const usesColumnChildren = columns === undefined
  const tableClassName = [
    'app-table',
    usesColumnChildren ? 'rs-table' : '',
    wordWrap ? 'app-table--word-wrap' : '',
    className,
  ].filter(Boolean).join(' ')
  const resolvedColumns = columns ?? buildColumns<T>(children)
  const tableStyle: CSSProperties | undefined = height || width ? { ...style, height, width } : style

  return (
    <div className="app-table__container">
      <table className={tableClassName} style={tableStyle} {...tableProps}>
        <thead>
          <tr>
            {resolvedColumns.map((column) => (
              <th key={column.id ?? column.key} className={getHeaderClassName(column)} style={getCellStyle(column)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={getRowKey(row, rowIndex, rowKey)}>
                {resolvedColumns.map((column) => (
                  <td key={column.id ?? column.key} className={getBodyCellClassName(column)} style={getBodyCellStyle(column)}>
                    {column.render ? column.render(row, rowIndex) : renderCellValue(Reflect.get(row, column.key))}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="app-table__empty" colSpan={resolvedColumns.length}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export function Column(_props: ColumnProps) {
  void _props
  return null
}

export function HeaderCell(_props: HeaderCellProps) {
  void _props
  return null
}

export function Cell<T extends TableRow = TableRow>(_props: CellProps<T>) {
  void _props
  return null
}

export default Table
