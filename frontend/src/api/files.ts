import { api } from './client'
import type { SpreadsheetFile, Sheet, CellValue } from '../types/spreadsheet'

export const filesApi = {
  list(): Promise<SpreadsheetFile[]> {
    return api.request<SpreadsheetFile[]>('/api/files')
  },

  upload(file: File): Promise<SpreadsheetFile> {
    const form = new FormData()
    form.append('file', file)
    return api.request<SpreadsheetFile>('/api/files', {
      method: 'POST',
      headers: {},
      body: form,
    })
  },

  listSheets(fileId: string): Promise<string[]> {
    return api.request<string[]>(`/api/files/${fileId}/sheets`)
  },

  getSheet(fileId: string, sheetName: string): Promise<Sheet> {
    return api.request<Sheet>(`/api/files/${fileId}/sheets/${encodeURIComponent(sheetName)}`)
  },

  async exportFile(fileId: string): Promise<void> {
    const { blob, filename } = await api.requestBlob(`/api/files/${fileId}/export`)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  },

  updateCell(
    fileId: string,
    sheetName: string,
    row: number,
    col: number,
    value: CellValue,
  ): Promise<void> {
    return api.request<void>(
      `/api/files/${fileId}/sheets/${encodeURIComponent(sheetName)}/cells`,
      {
        method: 'PATCH',
        body: JSON.stringify({ row, col, value }),
      },
    )
  },

  remove(fileId: string): Promise<void> {
    return api.request<void>(`/api/files/${fileId}`, { method: 'DELETE' })
  },
}
