import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import rateLimit from 'express-rate-limit'
import { authenticate } from '../middlewares/authenticate'
import {
  listFiles,
  uploadFile,
  deleteFile,
  listSheets,
  getSheet,
  exportFile,
  updateCell,
} from '../controllers/filesController'

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, ext === '.xlsx' || ext === '.xls')
  },
})

const filesLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
})

export const filesRouter = Router()

filesRouter.use(filesLimiter)
filesRouter.use(authenticate)
filesRouter.get('/', listFiles)
filesRouter.post('/', upload.single('file'), uploadFile)
filesRouter.delete('/:id', deleteFile)
filesRouter.get('/:id/sheets', listSheets)
filesRouter.get('/:id/sheets/:sheetName', getSheet)
filesRouter.get('/:id/export', exportFile)
filesRouter.patch('/:id/sheets/:sheetName/cells', updateCell)
