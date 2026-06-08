import React, { useState, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { runJavaScript } from '../utils/codeRunner'
import { usePyodide } from '../hooks/usePyodide'

const LANGUAGES = ['javascript', 'typescript', 'python']

const OVERREACT_THEME = {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#0d1117',
    'editor.lineHighlightBackground': '#161b22',
    'editorLineNumber.foreground': '#30363d',
    'editorLineNumber.activeForeground': '#58a6ff',
  },
}

export default function CodeElement({ element, locked, onUpdate }) {
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)
  const [collapsed, setCollapsed] = useState(true)
  const [editorHeight, setEditorHeight] = useState(130)
  const dragStartY = useRef(null)
  const dragStartHeight = useRef(null)
  const themeRegistered = useRef(false)
  const { loading: pyLoading, runPython } = usePyodide()

  const onResizeStart = useCallback((e) => {
    e.preventDefault()
    dragStartY.current = e.clientY
    dragStartHeight.current = editorHeight

    const onMove = (e) => {
      const delta = e.clientY - dragStartY.current
      setEditorHeight(Math.max(60, dragStartHeight.current + delta))
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [editorHeight])

  const run = async () => {
    setRunning(true)
    setOutput('')
    setError('')

    try {
      let result
      if (element.language === 'python') {
        result = await runPython(element.code)
      } else {
        result = await runJavaScript(element.code)
      }
      setOutput(result.output ?? '')
      setError(result.error ?? '')
    } catch (e) {
      setError(e.message)
    } finally {
      setRunning(false)
    }
  }

  const isRunning = running || (element.language === 'python' && pyLoading)

  const monacoLang =
    element.language === 'typescript' ? 'typescript'
    : element.language === 'python' ? 'python'
    : 'javascript'

  const handleBeforeMount = (monaco) => {
    if (!themeRegistered.current) {
      monaco.editor.defineTheme('overreact-dark', OVERREACT_THEME)
      themeRegistered.current = true
    }
  }

  const handleMount = (_editor, monaco) => {
    monaco.editor.setTheme('overreact-dark')
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-700">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/80 border-b border-gray-700">
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-gray-600 hover:text-gray-300 transition-colors text-xs w-4 text-center"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '▶' : '▼'}
        </button>

        <div className="flex gap-1.5 mr-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>

        {locked ? (
          <span className="text-xs text-gray-500 font-mono">{element.language}</span>
        ) : (
          <select
            value={element.language}
            onChange={(e) => onUpdate({ ...element, language: e.target.value })}
            className="text-xs bg-gray-800 text-gray-400 border border-gray-700 rounded px-1.5 py-0.5 outline-none cursor-pointer"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        )}

        {collapsed && (
          <span className="text-xs text-gray-600 font-mono truncate max-w-xs ml-1">
            {element.code.split('\n')[0].slice(0, 60)}
          </span>
        )}

        <button
          onClick={run}
          disabled={isRunning}
          className="ml-auto px-3 py-0.5 text-xs rounded bg-green-900/80 hover:bg-green-800 text-green-300 disabled:opacity-40 disabled:cursor-wait transition-colors font-mono border border-green-800/50"
        >
          {isRunning
            ? element.language === 'python' && pyLoading
              ? '⏳ Loading Python...'
              : '⏳ Running...'
            : '▶  Run'}
        </button>
      </div>

      {/* Editor — hidden when collapsed */}
      {!collapsed && (
        <>
          <Editor
            height={editorHeight}
            language={monacoLang}
            value={element.code}
            onChange={locked ? undefined : (v) => onUpdate({ ...element, code: v ?? '' })}
            beforeMount={handleBeforeMount}
            onMount={handleMount}
            options={{
              readOnly: locked,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 12,
              lineNumbers: 'on',
              wordWrap: 'on',
              renderLineHighlight: locked ? 'none' : 'gutter',
              folding: false,
              contextmenu: !locked,
              overviewRulerLanes: 0,
              scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
              automaticLayout: true,
              padding: { top: 6, bottom: 6 },
            }}
          />
          {/* Drag-to-resize handle */}
          <div
            onMouseDown={onResizeStart}
            className="flex items-center justify-center h-2 bg-gray-900 hover:bg-gray-700 cursor-ns-resize border-t border-gray-700 group/resize transition-colors"
            title="Drag to resize"
          >
            <div className="w-8 h-0.5 rounded-full bg-gray-700 group-hover/resize:bg-gray-400 transition-colors" />
          </div>
        </>
      )}

      {/* Output */}
      {(output || error) && (
        <div className="border-t border-gray-700 bg-gray-950 font-mono text-xs">
          <div className="px-3 py-0.5 text-gray-600 bg-gray-900/60 border-b border-gray-800">
            output
          </div>
          {output && (
            <pre className="px-4 py-2 text-green-300 whitespace-pre-wrap overflow-x-auto max-h-28 overflow-y-auto">
              {output}
            </pre>
          )}
          {error && (
            <pre className="px-4 py-2 text-red-400 whitespace-pre-wrap overflow-x-auto max-h-28 overflow-y-auto">
              {error}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
