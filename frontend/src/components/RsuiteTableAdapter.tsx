import { Children, isValidElement, type CSSProperties, type ReactNode } from 'react'
import { Table as AppTable, type TableColumn, type TableRow } from './Table'

type ColumnAlign = 'center' | 'left' | 'right'
type FixedPosition = boolean | 'left' | 'right'

export interface TableProps<T extends TableRow = TableRow> {
  autoHeight?: boolean
  bordered?: boolean
  children?: ReactNode
  className?: string
  data?: T[]
  fillHeight?: boolean
  headerHeight?: number
  height?: number
  hover?: boolean
  rowHeight?: number
  style?: CSSProperties
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

function toTableClassName(className?: string) {
  return ['rs-table', className ?? ''].filter(Boolean).join(' ')
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

export function Table<T extends TableRow = TableRow>({
  children,
  className,
  data = [],
  height,
  style,
}: TableProps<T>) {
  const tableStyle: CSSProperties = {
    ...style,
    height,
  }

  return (
    <AppTable
      className={toTableClassName(className)}
      columns={buildColumns<T>(children)}
      data={data}
      rowKey={(_, rowIndex) => rowIndex}
      style={tableStyle}
    />
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
