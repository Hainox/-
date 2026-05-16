import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { Sheet } from '../types/spreadsheet'
import { SheetViewerPage } from '../pages/SheetViewerPage'

const updateCellMock = vi.fn(() => Promise.resolve())
const exportFileMock = vi.fn(() => Promise.resolve())
const setRowsMock = vi.fn()

const sheetMock: Sheet = {
  name: 'Sheet1',
  columns: [{ key: '1', label: 'Name' }],
  rows: [{ '1': 'Alice' }],
}

vi.mock('../api/files', () => ({
  filesApi: {
    exportFile: (...args: unknown[]) => exportFileMock(...args),
    updateCell: (...args: unknown[]) => updateCellMock(...args),
  },
}))

vi.mock('../hooks/useSheets', () => ({
  useSheets: () => ({ sheets: ['Sheet1'], loading: false }),
}))

vi.mock('../hooks/useSheet', () => ({
  useSheet: () => ({
    sheet: sheetMock,
    loading: false,
    error: null,
    rows: sheetMock.rows,
    setRows: setRowsMock,
  }),
}))

describe('SheetViewerPage', () => {
  beforeEach(() => {
    updateCellMock.mockClear()
    exportFileMock.mockClear()
    setRowsMock.mockClear()
  })

  it('edits a cell and exports file', async () => {
    render(
      <MemoryRouter initialEntries={['/files/file-1/sheets/Sheet1']}>
        <Routes>
          <Route path="/files/:fileId/sheets/:sheetName" element={<SheetViewerPage />} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.doubleClick(screen.getByText('Alice'))

    const input = screen.getByDisplayValue('Alice')
    fireEvent.change(input, { target: { value: '123' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(updateCellMock).toHaveBeenCalledWith('file-1', 'Sheet1', 2, 1, 123)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Скачать .xlsx' }))

    await waitFor(() => {
      expect(exportFileMock).toHaveBeenCalledWith('file-1')
    })
  })
})
