import { useReducer, useEffect, useCallback } from 'react'
import { filesApi } from '../api/files'

interface State {
  sheets: string[]
  loading: boolean
}

type Action = { type: 'FETCHING' } | { type: 'SUCCESS'; sheets: string[] } | { type: 'ERROR' }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'FETCHING':
      return { sheets: [], loading: true }
    case 'SUCCESS':
      return { sheets: action.sheets, loading: false }
    case 'ERROR':
      return { sheets: [], loading: false }
  }
}

export function useSheets(fileId: string) {
  const [state, dispatch] = useReducer(reducer, { sheets: [], loading: true })

  const fetchSheets = useCallback(
    (signal: AbortSignal) =>
      filesApi
        .listSheets(fileId)
        .then((sheets) => {
          if (!signal.aborted) dispatch({ type: 'SUCCESS', sheets })
        })
        .catch(() => {
          if (!signal.aborted) dispatch({ type: 'ERROR' })
        }),
    [fileId],
  )

  useEffect(() => {
    const controller = new AbortController()
    dispatch({ type: 'FETCHING' })
    fetchSheets(controller.signal)
    return () => controller.abort()
  }, [fetchSheets])

  return state
}
