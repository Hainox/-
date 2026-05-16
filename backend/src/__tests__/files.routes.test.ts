import fs from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { app } from '../app'
import { filesService } from '../services/filesService'

describe('Files routes', () => {
  const secret = 'test-secret'
  let authHeader = ''

  beforeEach(() => {
    process.env.JWT_SECRET = secret
    authHeader = `Bearer ${jwt.sign({ sub: 'user-1' }, secret)}`
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('GET /api/files/:id/sheets returns sheet names', async () => {
    const listSheetsSpy = vi.spyOn(filesService, 'listSheets').mockResolvedValue(['Sheet1', 'Data'])

    const res = await request(app).get('/api/files/file-1/sheets').set('Authorization', authHeader)

    expect(res.status).toBe(200)
    expect(res.body).toEqual(['Sheet1', 'Data'])
    expect(listSheetsSpy).toHaveBeenCalledWith({ fileId: 'file-1', userId: 'user-1' })
  })

  it('GET /api/files/:id/export returns file with correct filename header', async () => {
    const tempPath = path.join('/tmp', `wes-export-${Date.now()}.xlsx`)
    fs.writeFileSync(tempPath, 'test')
    const exportSpy = vi
      .spyOn(filesService, 'exportFile')
      .mockResolvedValue({ filePath: tempPath, fileName: 'report.xlsx' })

    const res = await request(app).get('/api/files/file-1/export').set('Authorization', authHeader)

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    expect(res.headers['content-disposition']).toContain('filename="report.xlsx"')
    expect(exportSpy).toHaveBeenCalledWith({ fileId: 'file-1', userId: 'user-1' })

    fs.unlinkSync(tempPath)
  })

  it('PATCH /api/files/:id/sheets/:sheetName/cells updates cell', async () => {
    const updateCellSpy = vi.spyOn(filesService, 'updateCell').mockResolvedValue()

    const res = await request(app)
      .patch('/api/files/file-1/sheets/Sheet1/cells')
      .set('Authorization', authHeader)
      .send({ row: 2, col: 1, value: 123 })

    expect(res.status).toBe(204)
    expect(updateCellSpy).toHaveBeenCalledWith({
      fileId: 'file-1',
      userId: 'user-1',
      sheetName: 'Sheet1',
      row: 2,
      col: 1,
      value: 123,
    })
  })

  it('PATCH /api/files/:id/sheets/:sheetName/cells validates row and col', async () => {
    const updateCellSpy = vi.spyOn(filesService, 'updateCell').mockResolvedValue()

    const res = await request(app)
      .patch('/api/files/file-1/sheets/Sheet1/cells')
      .set('Authorization', authHeader)
      .send({ row: '2', col: 1, value: 'abc' })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ message: 'row and col must be numbers' })
    expect(updateCellSpy).not.toHaveBeenCalled()
  })
})
