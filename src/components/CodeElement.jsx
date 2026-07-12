import React, { useState, useRef, useCallback, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { runJavaScript } from '../utils/codeRunner'
import { usePyodide } from '../hooks/usePyodide'
import { compileReact, buildIframeSrc } from '../utils/reactRunner'

const LANGUAGES = ['javascript', 'typescript', 'python', 'react']

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
  const [previewSrc, setPreviewSrc] = useState('')
  const [logs, setLogs] = useState([])
  const [splitPercent, setSplitPercent] = useState(50)
  const [consoleHeight, setConsoleHeight] = useState(120)
  const [editorHeight, setEditorHeight] = useState(element.editorHeight ?? 130)
  const iframeRef = useRef(null)
  const logsEndRef = useRef(null)
  const splitContainerRef = useRef(null)
  const dragStartY = useRef(null)
  const dragStartHeight = useRef(null)
  const themeRegistered = useRef(false)
  const editorInstanceRef = useRef(null)

  const onSplitDragStart = useCallback((e) => {
    e.preventDefault()
    const container = splitContainerRef.current
    if (!container) return
    const { left, width } = container.getBoundingClientRect()

    const onMove = (e) => {
      const pct = Math.min(80, Math.max(20, ((e.clientX - left) / width) * 100))
      setSplitPercent(pct)
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  const onConsoleDragStart = useCallback((e) => {
    e.preventDefault()
    const startY = e.clientY
    const startConsoleHeight = consoleHeight
    const onMove = (e) => {
      const delta = startY - e.clientY
      setConsoleHeight(Math.min(editorHeight - 60, Math.max(32, startConsoleHeight + delta)))
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [consoleHeight, editorHeight])
  const { loading: pyLoading, runPython } = usePyodide()

  const isReact = element.language === 'react'

  // Listen for console messages relayed from the sandboxed iframe
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type !== 'console') return
      if (iframeRef.current && e.source !== iframeRef.current.contentWindow) return
      setLogs((prev) => [...prev, { level: e.data.level, text: e.data.args.join(' ') }])
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])
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
    setPreviewSrc('')
    setLogs([])

    try {
      if (isReact) {
        const { code: compiled, error: compileError } = await compileReact(element.code)
        if (compileError) {
          setError(compileError)
        } else {
          setPreviewSrc(buildIframeSrc(compiled))
          // Expand if collapsed so user sees the preview
          if (collapsed) setCollapsed(false)
        }
      } else if (element.language === 'python') {
        const result = await runPython(element.code)
        setOutput(result.output ?? '')
        setError(result.error ?? '')
      } else {
        const result = await runJavaScript(element.code)
        setOutput(result.output ?? '')
        setError(result.error ?? '')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setRunning(false)
    }
  }

  const isRunning = running || (element.language === 'python' && pyLoading)

  const monacoLang =
    isReact ? 'javascript'
    : element.language === 'typescript' ? 'typescript'
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
              Fit
            </button>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="px-2 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? 'Expand' : 'Collapse'}
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

      {/* Editor + optional React preview side panel */}
      {!collapsed && (
        <>
          <div ref={splitContainerRef} className="flex">
            {/* Editor */}
            <div style={isReact ? { width: `${splitPercent}%` } : { width: '100%' }}>
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
            </div>

            {/* Vertical drag handle */}
            {isReact && (
              <div
                onMouseDown={onSplitDragStart}
                className="w-1 flex-shrink-0 bg-gray-200 hover:bg-indigo-400 cursor-col-resize transition-colors group/vsplit"
                title="Drag to resize"
              />
            )}

            {/* React preview panel */}
            {isReact && (
              <div className="flex flex-col bg-white" style={{ width: `${100 - splitPercent}%`, height: editorHeight }}>
                <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200 flex-shrink-0">
                  <span className="text-xs text-gray-400 font-medium">Preview</span>
                  {previewSrc && (
                    <button
                      onClick={() => setPreviewSrc('')}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      title="Clear preview"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {previewSrc ? (
                  <iframe
                    ref={iframeRef}
                    srcDoc={previewSrc}
                    sandbox="allow-scripts"
                    className="border-none w-full flex-1 min-h-0"
                    title="React preview"
                  />
                ) : (
                  <div className="flex-1 min-h-0 flex items-center justify-center text-gray-300">
                    <div>
                      <div className="text-2xl text-center mb-1">⚛</div>
                      <p className="text-xs text-center px-4 leading-relaxed">
                        Click <span className="font-medium text-gray-400">▶ Run</span> to render
                      </p>
                    </div>
                  </div>
                )}

                {/* Preview / console drag handle */}
                <div
                  onMouseDown={onConsoleDragStart}
                  className="h-1 flex-shrink-0 bg-gray-200 hover:bg-indigo-400 cursor-ns-resize transition-colors"
                  title="Drag to resize console"
                />

                {/* Console panel */}
                <div
                  className="flex-shrink-0 bg-gray-100 flex flex-col"
                  style={{ height: consoleHeight }}
                >
                  <div className="flex items-center justify-between px-3 py-1 border-b border-gray-200 flex-shrink-0">
                    <span className="text-xs text-gray-400 font-mono">console</span>
                    {logs.length > 0 && (
                      <button
                        onClick={() => setLogs([])}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        title="Clear console"
                      >
                        clear
                      </button>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto px-3 py-1.5 space-y-0.5 bg-white">
                    {logs.length === 0 ? (
                      <span className="text-xs text-gray-400 font-mono">No output</span>
                    ) : (
                      logs.map((log, i) => (
                        <div key={i} className={`text-xs font-mono whitespace-pre-wrap break-all ${
                          log.level === 'error' ? 'text-red-500'
                          : log.level === 'warn' ? 'text-yellow-600'
                          : log.level === 'info' ? 'text-blue-500'
                          : 'text-gray-700'
                        }`}>
                          {log.level !== 'log' && (
                            <span className="opacity-50 mr-1">[{log.level}]</span>
                          )}
                          {log.text}
                        </div>
                      ))
                    )}
                    <div ref={logsEndRef} />
                  </div>
                </div>
              </div>
            )}
          </div>

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

      {/* Text/Python output — not shown for react */}
      {!isReact && (output || error) && (
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

      {/* React compile error */}
      {isReact && error && (
        <div className="border-t border-gray-200 bg-white">
          <pre className="px-4 py-3 text-red-500 text-xs whitespace-pre-wrap font-mono overflow-x-auto max-h-28 overflow-y-auto">
            {error}
          </pre>
        </div>
      )}
    </div>
  )
}
