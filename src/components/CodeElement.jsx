import React, { useState, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { runJavaScript } from '../utils/codeRunner'
import { usePyodide } from '../hooks/usePyodide'

const LANGUAGES = ['javascript', 'typescript', 'python']

const OVERREACT_THEME = {
  base: 'vs',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#f8fafc',
    'editor.lineHighlightBackground': '#f1f5f9',
    'editorLineNumber.foreground': '#94a3b8',
    'editorLineNumber.activeForeground': '#6366f1',
    'editorIndentGuide.background': '#e2e8f0',
  },
}

export default function CodeElement({ element, locked, onUpdate }) {
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)
  const [editorHeight, setEditorHeight] = useState(element.editorHeight ?? 130)
  const dragStartY = useRef(null)
  const dragStartHeight = useRef(null)
  const themeRegistered = useRef(false)
  const editorInstanceRef = useRef(null)

  const collapsed = element.collapsed ?? true

  const setCollapsed = (val) => {
    const next = typeof val === 'function' ? val(collapsed) : val
    onUpdate({ ...element, collapsed: next })
  }

  const fitText = () => {
    if (editorInstanceRef.current) {
      const h = editorInstanceRef.current.getContentHeight()
      setEditorHeight(h)
      onUpdate({ ...element, editorHeight: h })
    }
  }
  const { loading: pyLoading, runPython } = usePyodide()

  const onResizeStart = useCallback((e) => {
    e.preventDefault()
    dragStartY.current = e.clientY
    dragStartHeight.current = editorHeight
    const snapElement = element

    const onMove = (e) => {
      const delta = e.clientY - dragStartY.current
      setEditorHeight(Math.max(60, dragStartHeight.current + delta))
    }
    const onUp = (e) => {
      const h = Math.max(60, dragStartHeight.current + (e.clientY - dragStartY.current))
      onUpdate({ ...snapElement, editorHeight: h })
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [editorHeight, element, onUpdate])

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
      monaco.editor.defineTheme('overreact-light', OVERREACT_THEME)
      themeRegistered.current = true
    }
  }

  const handleMount = (editor, monaco) => {
    monaco.editor.setTheme('overreact-light')
    editorInstanceRef.current = editor
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        </div>

        {locked ? (
          <span className="text-xs text-gray-400 font-medium ml-1">{element.language}</span>
        ) : (
          <select
            value={element.language}
            onChange={(e) => onUpdate({ ...element, language: e.target.value })}
            className="text-xs bg-white text-gray-600 border border-gray-200 rounded px-1.5 py-0.5 outline-none cursor-pointer focus:border-indigo-400 ml-1"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        )}

        {collapsed && (
          <span className="text-xs text-gray-400 font-mono truncate max-w-sm ml-1">
            {element.code.split('\n')[0].slice(0, 60)}
          </span>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          {!collapsed && (
            <button
              onClick={fitText}
              className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              title="Resize editor to fit all code"
            >
              Fit Text
            </button>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? 'Collapsed' : 'Expanded'}
          </button>
          <button
            onClick={run}
            disabled={isRunning}
            className="px-3 py-1 text-xs rounded-md bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-wait transition-colors font-medium shadow-sm"
          >
            {isRunning
              ? element.language === 'python' && pyLoading
                ? 'Loading Python...'
                : 'Running...'
              : '▶  Run'}
          </button>
        </div>
      </div>

      {/* Editor */}
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
              padding: { top: 8, bottom: 8 },
            }}
          />
          {/* Drag-to-resize handle */}
          <div
            onMouseDown={onResizeStart}
            className="flex items-center justify-center h-2 bg-gray-50 hover:bg-gray-100 cursor-ns-resize border-t border-gray-200 group/resize transition-colors"
            title="Drag to resize"
          >
            <div className="w-8 h-0.5 rounded-full bg-gray-300 group-hover/resize:bg-gray-500 transition-colors" />
          </div>
        </>
      )}

      {/* Output */}
      {(output || error) && (
        <div className="border-t border-gray-200 bg-white text-xs font-mono">
          <div className="px-3 py-1 text-gray-400 bg-gray-50 border-b border-gray-100 text-xs font-sans font-medium">
            Output
          </div>
          {output && (
            <pre className="px-4 py-3 text-emerald-700 whitespace-pre-wrap overflow-x-auto max-h-28 overflow-y-auto">
              {output}
            </pre>
          )}
          {error && (
            <pre className="px-4 py-3 text-red-500 whitespace-pre-wrap overflow-x-auto max-h-28 overflow-y-auto">
              {error}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
