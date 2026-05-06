import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSheet } from '../hooks/useSheet'
import { useSheets } from '../hooks/useSheets'
import { TableView } from '../components/TableView'
import { ChartView } from '../components/ChartView'
import { Spinner } from '../components/Spinner'
import { Button } from '../components/Button'
import { filesApi } from '../api/files'
import type { CellValue } from '../types/spreadsheet'

export function SheetViewerPage() {
  const { fileId = '', sheetName = '' } = useParams<{
    fileId: string
    sheetName?: string
  }>()
  const navigate = useNavigate()
  const { sheets, loading: sheetsLoading } = useSheets(fileId)
  const activeSheet = sheetName || sheets[0] || 'Sheet1'
  const { sheet, loading, error, rows, setRows } = useSheet(fileId, activeSheet)
  const [tab, setTab] = useState<'table' | 'chart' | 'info'>('table')
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  async function handleExport() {
    setExporting(true)
    setExportError(null)
    try {
      await filesApi.exportFile(fileId)
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'Ошибка экспорта')
    } finally {
      setExporting(false)
    }
  }

  const handleCellEdit = useCallback(
    async (rowIndex: number, colKey: string, value: CellValue) => {
      // row 1 is header, data starts at row 2
      const excelRow = rowIndex + 2
      const excelCol = Number(colKey)
      await filesApi.updateCell(fileId, activeSheet, excelRow, excelCol, value)
      setRows((prev) =>
        prev.map((r, i) => (i === rowIndex ? { ...r, [colKey]: value } : r)),
      )
    },
    [fileId, activeSheet, setRows],
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Назад"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-gray-900 truncate">
            {sheet?.name ?? activeSheet}
          </h1>
          {sheet && (
            <p className="text-xs text-gray-400">
              {sheet.rows.length} строк · {sheet.columns.length} столбцов
            </p>
          )}
        </div>

        {/* Sheet selector */}
        {!sheetsLoading && sheets.length > 1 && (
          <select
            value={activeSheet}
            onChange={(e) =>
              navigate(`/files/${fileId}/sheets/${encodeURIComponent(e.target.value)}`)
            }
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sheets.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}

        {/* Export button */}
        <Button variant="secondary" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Скачивание...' : 'Скачать .xlsx'}
        </Button>

        {/* Tab buttons */}
        <div className="flex gap-2">
          <Button
            variant={tab === 'table' ? 'primary' : 'secondary'}
            onClick={() => setTab('table')}
          >
            Таблица
          </Button>
          <Button
            variant={tab === 'chart' ? 'primary' : 'secondary'}
            onClick={() => setTab('chart')}
          >
            График
          </Button>
          <Button
            variant={tab === 'info' ? 'primary' : 'secondary'}
            onClick={() => setTab('info')}
          >
            Инфо
          </Button>
        </div>
      </header>

      <main className="max-w-full px-6 py-6">
        {exportError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 max-w-lg mx-auto mb-4">
            {exportError}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <Spinner className="w-8 h-8 text-blue-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 max-w-lg mx-auto mt-8">
            {error}
          </div>
        )}

        {sheet && tab === 'table' && (
          <TableView columns={sheet.columns} rows={rows} onCellEdit={handleCellEdit} />
        )}

        {sheet && tab === 'chart' && (
          <ChartView columns={sheet.columns} rows={rows} />
        )}

        {sheet && tab === 'info' && (
          <div className="max-w-sm mx-auto mt-8 bg-white border border-gray-200 rounded-xl p-6 space-y-3">
            <h2 className="font-semibold text-gray-900">Информация о листе</h2>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-500">Название</dt>
                <dd className="font-medium text-gray-900">{sheet.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Строк данных</dt>
                <dd className="font-medium text-gray-900">{sheet.rows.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Столбцов</dt>
                <dd className="font-medium text-gray-900">{sheet.columns.length}</dd>
              </div>
            </dl>
          </div>
        )}
      </main>
    </div>
  )
}
