import React from 'react'

function AutoTextarea({ value, onChange, className, placeholder }) {
  const ref = React.useRef(null)
  React.useLayoutEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }, [value])
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      rows={1}
      className={className}
      placeholder={placeholder}
    />
  )
}

export default function TableElement({ element, locked, onUpdate }) {
  const updateHeader = (i, value) => {
    const headers = [...element.headers]
    headers[i] = value
    onUpdate({ ...element, headers })
  }

  const updateCell = (ri, ci, value) => {
    const rows = element.rows.map((row, r) =>
      r === ri ? row.map((cell, c) => (c === ci ? value : cell)) : row
    )
    onUpdate({ ...element, rows })
  }

  const addRow = () =>
    onUpdate({ ...element, rows: [...element.rows, Array(element.headers.length).fill('')] })

  const removeRow = (ri) =>
    onUpdate({ ...element, rows: element.rows.filter((_, i) => i !== ri) })

  const moveRow = (ri, dir) => {
    const rows = [...element.rows]
    const target = ri + dir
    if (target < 0 || target >= rows.length) return;
    [rows[ri], rows[target]] = [rows[target], rows[ri]]
    onUpdate({ ...element, rows })
  }

  const addColumn = () =>
    onUpdate({
      ...element,
      headers: [...element.headers, `Col ${element.headers.length + 1}`],
      rows: element.rows.map((row) => [...row, '']),
    })

  if (locked) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {element.headers.map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left text-indigo-600 font-semibold text-xs uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {element.rows.map((row, ri) => (
              <tr key={ri} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-2.5 text-gray-700 text-sm whitespace-pre-wrap">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-indigo-300 overflow-hidden">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-indigo-50 border-b border-indigo-200">
            {element.headers.map((h, i) => (
              <th key={i} className="border-r border-indigo-200 last:border-r-0">
                <input
                  value={h}
                  onChange={(e) => updateHeader(i, e.target.value)}
                  className="w-full bg-transparent px-3 py-2 text-indigo-600 font-semibold text-xs uppercase tracking-wide outline-none focus:bg-indigo-100/50"
                  placeholder={`Header ${i + 1}`}
                />
              </th>
            ))}
            <th className="w-10 bg-indigo-50">
              <button
                onClick={addColumn}
                className="w-full py-2 text-indigo-400 hover:text-indigo-600 transition-colors text-sm"
                title="Add column"
              >
                +
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {element.rows.map((row, ri) => (
            <tr key={ri} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
              {row.map((cell, ci) => (
                <td key={ci} className="border-r border-gray-100 last:border-r-0">
                  <AutoTextarea
                    value={cell}
                    onChange={(e) => updateCell(ri, ci, e.target.value)}
                    className="w-full bg-transparent px-3 py-2 text-gray-700 outline-none focus:bg-indigo-50/40 resize-none overflow-hidden"
                    placeholder="—"
                  />
                </td>
              ))}
              <td className="w-16 text-center">
                <div className="flex items-center justify-center gap-0.5">
                  <button
                    onClick={() => moveRow(ri, -1)}
                    disabled={ri === 0}
                    className="px-1 py-1 text-gray-300 hover:text-indigo-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-xs"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveRow(ri, 1)}
                    disabled={ri === element.rows.length - 1}
                    className="px-1 py-1 text-gray-300 hover:text-indigo-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-xs"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeRow(ri)}
                    className="px-1 py-1 text-gray-300 hover:text-red-400 transition-colors text-xs"
                    title="Remove row"
                  >
                    ✕
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100">
        <button
          onClick={addRow}
          className="text-xs text-gray-400 hover:text-indigo-600 transition-colors font-medium"
        >
          + Add row
        </button>
      </div>
    </div>
  )
}
