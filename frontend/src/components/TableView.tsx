import { useState, useRef, useEffect } from 'react'
import type { Column, Row, SortConfig, CellValue } from '../types/spreadsheet'
import { sortRows } from '../utils/table'

interface TableViewProps {
  columns: Column[]
  rows: Row[]
  onCellEdit?: (rowIndex: number, colKey: string, value: CellValue) => Promise<void>
}

interface EditingCell {
  rowIndex: number
  colKey: string
}

export function TableView({ columns, rows, onCellEdit }: TableViewProps) {
  const [sort, setSort] = useState<SortConfig | null>(null)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<EditingCell | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeFilter = search.trim()

  const displayed = sortRows(
    activeFilter
      ? rows.filter((row) =>
          columns.some((col) => {
            const val = row[col.key]
            return val != null && String(val).toLowerCase().includes(activeFilter.toLowerCase())
          }),
        )
      : rows,
    sort,
  )

  function toggleSort(key: string) {
    setSort((prev) => {
      if (prev?.key !== key) return { key, direction: 'asc' }
      if (prev.direction === 'asc') return { key, direction: 'desc' }
      return null
    })
  }

  function startEdit(rowIndex: number, colKey: string, currentValue: CellValue) {
    if (!onCellEdit) return
    setEditing({ rowIndex, colKey })
    setEditValue(currentValue != null ? String(currentValue) : '')
  }

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  async function commitEdit() {
    if (!editing || !onCellEdit || saving) return
    setSaving(true)
    try {
      const numVal = Number(editValue)
      const value: CellValue = editValue === '' ? null : isNaN(numVal) ? editValue : numVal
      await onCellEdit(editing.rowIndex, editing.colKey, value)
    } finally {
      setSaving(false)
      setEditing(null)
    }
  }

  function cancelEdit() {
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search bar */}
      <input
        type="search"
        placeholder="Поиск по всем столбцам..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Stats */}
      <p className="text-xs text-gray-500">
        Показано {displayed.length} из {rows.length} строк
        {onCellEdit && (
          <span className="ml-2 text-gray-400">· Двойной клик по ячейке для редактирования</span>
        )}
      </p>

      {/* Table */}
      <div className="overflow-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap cursor-pointer select-none hover:bg-gray-100 transition-colors border-b border-gray-200"
                  onClick={() => toggleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sort?.key === col.key ? (sort.direction === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-gray-400">
                  Нет данных
                </td>
              </tr>
            ) : (
              displayed.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/40 transition-colors`}
                >
                  {columns.map((col) => {
                    const isEditing =
                      editing?.rowIndex === i && editing?.colKey === col.key
                    return (
                      <td
                        key={col.key}
                        className="px-3 py-2 text-gray-700 whitespace-nowrap"
                        onDoubleClick={() => startEdit(i, col.key, row[col.key])}
                      >
                        {isEditing ? (
                          <input
                            ref={inputRef}
                            value={editValue}
                            disabled={saving}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEdit()
                              if (e.key === 'Escape') cancelEdit()
                            }}
                            className="w-full border border-blue-400 rounded px-1 py-0.5 outline-none text-sm"
                          />
                        ) : (
                          row[col.key] != null ? String(row[col.key]) : '—'
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
