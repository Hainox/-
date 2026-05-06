import { useReducer, useEffect, useCallback, useState } from 'react'
import { filesApi } from '../api/files'
import type { Sheet, Row } from '../types/spreadsheet'

interface State {
  sheet: Sheet | null
  loading: boolean
  error: string | null
}

type Action =
  | { type: 'FETCHING' }
  | { type: 'SUCCESS'; sheet: Sheet }
  | { type: 'ERROR'; error: string }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'FETCHING':
      return { sheet: null, loading: true, error: null }
    case 'SUCCESS':
      return { sheet: action.sheet, loading: false, error: null }
    case 'ERROR':
      return { sheet: null, loading: false, error: action.error }
  }
}

interface UseSheetResult {
  sheet: Sheet | null
  loading: boolean
  error: string | null
  rows: Row[]
  setRows: React.Dispatch<React.SetStateAction<Row[]>>
}

export function useSheet(fileId: string, sheetName: string): UseSheetResult {
  const [state, dispatch] = useReducer(reducer, { sheet: null, loading: true, error: null })
  const [rows, setRows] = useState<Row[]>([])

  const fetchSheet = useCallback(
    (signal: AbortSignal) =>
      filesApi
        .getSheet(fileId, sheetName)
        .then((sheet) => {
          if (!signal.aborted) {
            dispatch({ type: 'SUCCESS', sheet })
            setRows(sheet.rows)
          }
        })
        .catch((e: unknown) => {
          if (!signal.aborted)
            dispatch({ type: 'ERROR', error: e instanceof Error ? e.message : 'Failed to load sheet' })
        }),
    [fileId, sheetName],
  )

  useEffect(() => {
    const controller = new AbortController()
    dispatch({ type: 'FETCHING' })
    setRows([])
    fetchSheet(controller.signal)
    return () => controller.abort()
  }, [fetchSheet])

  return { ...state, rows, setRows }
}
