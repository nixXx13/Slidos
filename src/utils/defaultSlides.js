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
