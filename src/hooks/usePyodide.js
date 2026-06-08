import { useState, useCallback } from 'react'

let pyodideInstance = null
let loadingPromise = null

async function ensurePyodide() {
  if (pyodideInstance) return pyodideInstance
  if (!loadingPromise) {
    loadingPromise = (async () => {
      if (!window.loadPyodide) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js'
          script.onload = resolve
          script.onerror = () => reject(new Error('Failed to load Pyodide script'))
          document.head.appendChild(script)
        })
      }
      pyodideInstance = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
      })
    })()
  }
  await loadingPromise
  return pyodideInstance
}

export function usePyodide() {
  const [loading, setLoading] = useState(false)

  const runPython = useCallback(async (code) => {
    const alreadyLoaded = !!pyodideInstance
    if (!alreadyLoaded) setLoading(true)

    try {
      const py = await ensurePyodide()
      setLoading(false)

      py.globals.set('_user_code', code)
      py.runPython(`
import sys, io, traceback as _tb
_buf = io.StringIO()
_err = None
_old = sys.stdout
sys.stdout = _buf
try:
    exec(_user_code)
except Exception as e:
    _err = _tb.format_exc()
finally:
    sys.stdout = _old
`)
      const output = py.runPython('_buf.getvalue()')
      const error = py.runPython('_err')
      return {
        output: String(output ?? ''),
        error: error ? String(error) : null,
      }
    } catch (e) {
      setLoading(false)
      return { output: '', error: e.message }
    }
  }, [])

  return { loading, runPython, isReady: () => !!pyodideInstance }
}
