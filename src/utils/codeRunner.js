export async function runJavaScript(code) {
  const logs = []
  const errors = []

  const originalLog = console.log
  const originalError = console.error
  const originalWarn = console.warn

  const stringify = (v) => {
    if (v === null) return 'null'
    if (v === undefined) return 'undefined'
    if (typeof v === 'object') {
      try { return JSON.stringify(v, null, 2) } catch { return String(v) }
    }
    return String(v)
  }

  console.log = (...args) => logs.push(args.map(stringify).join(' '))
  console.error = (...args) => errors.push(args.map(stringify).join(' '))
  console.warn = (...args) => logs.push('[warn] ' + args.map(stringify).join(' '))

  try {
    // AsyncFunction lets both sync and async code work
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
    const fn = new AsyncFunction(code)
    await fn()
  } catch (e) {
    errors.push(e.message)
  } finally {
    console.log = originalLog
    console.error = originalError
    console.warn = originalWarn
  }

  return {
    output: logs.join('\n'),
    error: errors.join('\n') || null,
  }
}
