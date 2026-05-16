import path from 'path'
import fs from 'fs'
import ExcelJS from 'exceljs'
import { prisma } from '../utils/prisma'

interface SaveInput {
  userId: string
  originalName: string
  size: number
  path: string
}

interface RemoveInput {
  fileId: string
  userId: string
}

interface ReadSheetInput {
  fileId: string
  userId: string
  sheetName: string
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

interface UpdateCellInput {
  fileId: string
  userId: string
  sheetName: string
  row: number
  col: number
  value: string | number | boolean | null
}

export const filesService = {
  async save({ userId, originalName, size, path: filePath }: SaveInput) {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filePath)
    const sheetCount = workbook.worksheets.length

    const record = await prisma.file.create({
      data: {
        userId,
        name: originalName,
        size,
        path: filePath,
        sheetCount,
      },
    })
    return record
  },

  async remove({ fileId, userId }: RemoveInput) {
    const record = await prisma.file.findFirst({ where: { id: fileId, userId } })
    if (!record) throw new Error('File not found')
    if (fs.existsSync(record.path)) fs.unlinkSync(record.path)
    await prisma.file.delete({ where: { id: fileId } })
  },

  async listSheets({ fileId, userId }: { fileId: string; userId: string }) {
    const record = await prisma.file.findFirst({ where: { id: fileId, userId } })
    if (!record) throw new Error('File not found')

    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(record.path)

    return workbook.worksheets.map((ws) => ws.name)
  },

  async readSheet({ fileId, userId, sheetName, page, pageSize, search, sortBy, sortDir }: ReadSheetInput) {
    const record = await prisma.file.findFirst({ where: { id: fileId, userId } })
    if (!record) throw new Error('File not found')

    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(record.path)

    const worksheet = workbook.getWorksheet(sheetName)
    if (!worksheet) throw new Error(`Sheet "${sheetName}" not found`)

    const columns: { key: string; label: string }[] = []
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      columns.push({ key: String(colNumber), label: cell.text || `Column ${colNumber}` })
    })

    const rows: Record<string, string | number | boolean | null>[] = []
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return
      const obj: Record<string, string | number | boolean | null> = {}
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const v = cell.value
        if (v === null || v === undefined) {
          obj[String(colNumber)] = null
        } else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
          obj[String(colNumber)] = v
        } else {
          obj[String(colNumber)] = String(v)
        }
      })
      rows.push(obj)
    })

    let processedRows = rows

    if (search?.trim()) {
      const needle = search.trim().toLowerCase()
      processedRows = processedRows.filter((row) =>
        columns.some((col) => {
          const value = row[col.key]
          return value != null && String(value).toLowerCase().includes(needle)
        }),
      )
    }

    if (sortBy && columns.some((c) => c.key === sortBy)) {
      const direction = sortDir === 'desc' ? -1 : 1
      const key = sortBy
      processedRows = [...processedRows].sort((a, b) => {
        const av = a[key]
        const bv = b[key]
        if (av == null && bv == null) return 0
        if (av == null) return 1
        if (bv == null) return -1
        if (typeof av === 'number' && typeof bv === 'number') {
          return (av - bv) * direction
        }
        return String(av).localeCompare(String(bv), 'ru', { sensitivity: 'base' }) * direction
      })
    }

    const totalRows = processedRows.length
    const hasPagination = typeof page === 'number' || typeof pageSize === 'number'
    const safePage = Math.max(1, Math.floor(page ?? 1))
    const safePageSize = Math.max(1, Math.min(200, Math.floor(pageSize ?? (totalRows || 1))))
    const totalPages = Math.max(1, Math.ceil(totalRows / safePageSize))
    const start = (safePage - 1) * safePageSize
    const paginatedRows = hasPagination ? processedRows.slice(start, start + safePageSize) : processedRows

    return {
      name: sheetName,
      columns,
      rows: paginatedRows,
      pagination: { page: safePage, pageSize: safePageSize, totalRows, totalPages },
    }
  },

  async exportFile({ fileId, userId }: { fileId: string; userId: string }) {
    const record = await prisma.file.findFirst({ where: { id: fileId, userId } })
    if (!record) throw new Error('File not found')
    return { filePath: record.path, fileName: record.name }
  },

  async updateCell({ fileId, userId, sheetName, row, col, value }: UpdateCellInput) {
    const record = await prisma.file.findFirst({ where: { id: fileId, userId } })
    if (!record) throw new Error('File not found')

    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(record.path)

    const worksheet = workbook.getWorksheet(sheetName)
    if (!worksheet) throw new Error(`Sheet "${sheetName}" not found`)

    const cell = worksheet.getRow(row).getCell(col)
    if (value === null || value === undefined) {
      cell.value = null
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      cell.value = value
    } else {
      cell.value = value
    }

    await workbook.xlsx.writeFile(record.path)
  },

  buildExportPath(name: string): string {
    return path.join('uploads', name)
  },
}
