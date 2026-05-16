import path from 'path'
import type { Response, NextFunction } from 'express'
import { prisma } from '../utils/prisma'
import { filesService } from '../services/filesService'
import type { AuthRequest } from '../middlewares/authenticate'

export async function listFiles(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const files = await prisma.file.findMany({
      where: { userId: req.userId! },
      orderBy: { uploadedAt: 'desc' },
    })
    res.json(files)
  } catch (err) {
    next(err)
  }
}

export async function uploadFile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' })
      return
    }
    const file = await filesService.save({
      userId: req.userId!,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
    })
    res.status(201).json(file)
  } catch (err) {
    next(err)
  }
}

export async function deleteFile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id)
    await filesService.remove({ fileId: id, userId: req.userId! })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function listSheets(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id)
    const sheets = await filesService.listSheets({ fileId: id, userId: req.userId! })
    res.json(sheets)
  } catch (err) {
    next(err)
  }
}

export async function getSheet(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id)
    const sheetName = String(req.params.sheetName)
    const pageValue = Number(req.query.page)
    const pageSizeValue = Number(req.query.pageSize)
    const page = Number.isFinite(pageValue) && pageValue > 0 ? Math.floor(pageValue) : undefined
    const pageSize =
      Number.isFinite(pageSizeValue) && pageSizeValue > 0 ? Math.floor(pageSizeValue) : undefined
    const search = typeof req.query.search === 'string' ? req.query.search : undefined
    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : undefined
    const sortDir = req.query.sortDir === 'desc' ? 'desc' : req.query.sortDir === 'asc' ? 'asc' : undefined
    const sheet = await filesService.readSheet({
      fileId: id,
      userId: req.userId!,
      sheetName,
      page,
      pageSize,
      search,
      sortBy,
      sortDir,
    })
    res.json(sheet)
  } catch (err) {
    next(err)
  }
}

export async function exportFile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id)
    const { filePath, fileName } = await filesService.exportFile({ fileId: id, userId: req.userId! })
    const downloadName = path.extname(fileName) ? fileName : `${fileName}.xlsx`
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`)
    res.sendFile(path.resolve(filePath))
  } catch (err) {
    next(err)
  }
}

export async function updateCell(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id)
    const sheetName = String(req.params.sheetName)
    const { row, col, value } = req.body as {
      row: number
      col: number
      value: string | number | boolean | null
    }
    if (typeof row !== 'number' || typeof col !== 'number') {
      res.status(400).json({ message: 'row and col must be numbers' })
      return
    }
    await filesService.updateCell({ fileId: id, userId: req.userId!, sheetName, row, col, value })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
