import type { ReactNode } from 'react'

type Column<T> = {
  key: string
  header: string
  render: (row: T) => ReactNode
}

type DataTableProps<T> = {
  columns: Array<Column<T>>
  data: T[]
  emptyLabel: string
}

export function DataTable<T>({ columns, data, emptyLabel }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="min-w-full bg-zinc-900/70 text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-zinc-900">
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-2 text-left font-medium text-zinc-300">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className="px-3 py-6 text-center text-zinc-400" colSpan={columns.length}>
                {emptyLabel}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={index} className="border-b border-white/5 last:border-b-0">
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-2 text-zinc-100">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
