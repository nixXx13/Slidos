let babelPromise = null

async function getBabel() {
  if (!babelPromise) {
    babelPromise = import('@babel/standalone')
  }
  return babelPromise
}

export async function compileReact(code) {
  const Babel = await getBabel()

  const processed = code
    .replace(/^import\s[\s\S]*?from\s+['"].*?['"]\s*;?\n?/gm, '')
    .replace(/export\s+default\s+/g, 'window.__OverReactDefault = ')

  try {
    const result = Babel.transform(processed, {
      presets: [['react', { runtime: 'classic' }]],
      filename: 'component.jsx',
    })
    return { code: result.code, error: null }
  } catch (e) {
    return { code: null, error: e.message }
  }
}

export function buildIframeSrc(transformedCode) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.development.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.development.js"><\/script>
<script>
// Expose hooks as globals so user code can write useState(...) instead of React.useState(...)
const { useState, useEffect, useRef, useCallback, useMemo, useContext,
        useReducer, useLayoutEffect, useId, useTransition, useDeferredValue } = React;
<\/script>
<style>
  body { margin: 0; padding: 16px; font-family: Inter, system-ui, sans-serif; font-size: 14px; color: #111827; }
  * { box-sizing: border-box; }
</style>
</head>
<body>
<div id="root"></div>
<script>
// Relay console output to parent via postMessage
;(function() {
  const send = (level, args) =>
    window.parent.postMessage({
      type: 'console',
      level,
      args: args.map(a => {
        if (a === null) return 'null'
        if (a === undefined) return 'undefined'
        if (typeof a === 'object') { try { return JSON.stringify(a, null, 2) } catch { return String(a) } }
        return String(a)
      }),
    }, '*')
  console.log   = (...a) => send('log',   a)
  console.error = (...a) => send('error', a)
  console.warn  = (...a) => send('warn',  a)
  console.info  = (...a) => send('info',  a)
})()
<\/script>
<script>
window.__OverReactDefault = null;
try {
  ${transformedCode}
  const Comp = window.__OverReactDefault;
  if (Comp) {
    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Comp));
  } else {
    document.getElementById('root').innerHTML =
      '<p style="color:#94a3b8;font-size:13px;margin:0">Export a default component to see the preview.<br><code style=\\"font-size:11px\\">export default function App() { ... }</code></p>';
  }
} catch(e) {
  document.body.innerHTML =
    '<pre style="color:#ef4444;font-size:12px;margin:0;white-space:pre-wrap">' + e.message + '<\/pre>';
}
<\/script>
</body>
</html>`
}
