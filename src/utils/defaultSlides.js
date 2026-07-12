const id = () => Math.random().toString(36).slice(2, 10)

export const defaultSlides = [
  {
    id: id(),
    title: 'Welcome to OverReact',
    elements: [
      {
        id: id(),
        type: 'text',
        content: 'Interactive slides powered by React.\n\n→  Arrow keys to navigate between slides\n🔒  Click the lock icon on any element to edit it\n+   Hover the bottom of a slide to add elements',
      },
    ],
  },
  {
    id: id(),
    title: 'Data Tables',
    elements: [
      {
        id: id(),
        type: 'text',
        content: 'Tables can be edited inline when unlocked. Add rows, columns, and edit cells directly.',
      },
      {
        id: id(),
        type: 'table',
        headers: ['Feature', 'Status', 'Notes'],
        rows: [
          ['Text elements', '✅ Done', 'Supports multiline'],
          ['Tables', '✅ Done', 'Editable rows & columns'],
          ['Code runner', '✅ Done', 'JS + Python (Pyodide)'],
          ['Import / Export', '✅ Done', 'JSON format'],
        ],
      },
    ],
  },
  {
    id: id(),
    title: 'Live Code Demo — JavaScript',
    elements: [
      {
        id: id(),
        type: 'text',
        content: 'Click ▶ Run to execute the code. Results appear below the editor.',
      },
      {
        id: id(),
        type: 'code',
        language: 'javascript',
        code: `// Fibonacci with memoization
const memo = {}
function fib(n) {
  if (n <= 1) return n
  if (memo[n]) return memo[n]
  return memo[n] = fib(n - 1) + fib(n - 2)
}

const results = Array.from({ length: 12 }, (_, i) => fib(i))
console.log('Fibonacci sequence:')
console.log(results.join(', '))
console.log('\\nFib(40) =', fib(40))`,
      },
    ],
  },
  {
    id: id(),
    title: 'Live React Demo',
    elements: [
      {
        id: id(),
        type: 'text',
        content: 'Select <strong>react</strong> as the language, write a component, and click ▶ Run to see it rendered live in the side panel.',
      },
      {
        id: id(),
        type: 'code',
        language: 'react',
        code: `function Counter() {
  const [count, setCount] = React.useState(0)
  const [color, setColor] = React.useState('#6366f1')

  return (
    <div style={{ fontFamily: 'system-ui', padding: '24px', maxWidth: 320 }}>
      <h2 style={{ color, marginTop: 0, fontSize: 28, fontWeight: 700 }}>
        Count: {count}
      </h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setCount(c => c - 1)}
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb',
            background: '#f9fafb', cursor: 'pointer', fontSize: 18 }}
        >−</button>
        <button
          onClick={() => setCount(c => c + 1)}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none',
            background: color, color: '#fff', cursor: 'pointer', fontSize: 18, fontWeight: 600 }}
        >+</button>
        <button
          onClick={() => setCount(0)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb',
            background: '#f9fafb', cursor: 'pointer', fontSize: 13, color: '#6b7280' }}
        >Reset</button>
      </div>
      <label style={{ fontSize: 13, color: '#6b7280' }}>
        Accent color:{' '}
        <input type="color" value={color} onChange={e => setColor(e.target.value)}
          style={{ marginLeft: 8, cursor: 'pointer' }} />
      </label>
    </div>
  )
}

export default Counter`,
      },
    ],
  },
  {
    id: id(),
    title: 'Live Code Demo — Python',
    elements: [
      {
        id: id(),
        type: 'text',
        content: 'Python runs via Pyodide (WebAssembly). First run loads the runtime (~10 MB).',
      },
      {
        id: id(),
        type: 'code',
        language: 'python',
        code: `# Python list comprehensions & generators
squares = [x**2 for x in range(1, 11)]
print("Squares:", squares)

# Generator example
def primes(limit):
    sieve = list(range(2, limit + 1))
    for p in sieve:
        sieve = [x for x in sieve if x == p or x % p != 0]
        yield p

print("\\nPrimes up to 50:")
print(list(primes(50)))`,
      },
    ],
  },
]
