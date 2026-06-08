import React from 'react'

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

  const addColumn = () =>
    onUpdate({
      ...element,
      headers: [...element.headers, `Col ${element.headers.length + 1}`],
      rows: element.rows.map((row) => [...row, '']),
    })

  if (locked) {
    return (
      <div className="overflow-x-auto rounded border border-gray-800">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              {element.headers.map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left text-green-400 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {element.rows.map((row, ri) => (
              <tr key={ri} className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-2 text-gray-300">
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
    <div className="rounded border border-green-700 overflow-hidden">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-900 border-b border-gray-700">
            {element.headers.map((h, i) => (
              <th key={i} className="border-r border-gray-700 last:border-r-0">
                <input
                  value={h}
                  onChange={(e) => updateHeader(i, e.target.value)}
                  className="w-full bg-transparent px-3 py-2 text-green-400 font-semibold outline-none focus:bg-gray-800/50"
                  placeholder={`Header ${i + 1}`}
                />
              </th>
            ))}
            <th className="w-10 bg-gray-900">
              <button
                onClick={addColumn}
                className="w-full py-2 text-gray-600 hover:text-green-400 transition-colors text-sm"
                title="Add column"
              >
                +
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {element.rows.map((row, ri) => (
            <tr key={ri} className="border-b border-gray-800 hover:bg-gray-800/20">
              {row.map((cell, ci) => (
                <td key={ci} className="border-r border-gray-800 last:border-r-0">
                  <input
                    value={cell}
                    onChange={(e) => updateCell(ri, ci, e.target.value)}
                    className="w-full bg-transparent px-3 py-2 text-gray-300 outline-none focus:bg-gray-800/50"
                    placeholder="—"
                  />
                </td>
              ))}
              <td className="w-10 text-center">
                <button
                  onClick={() => removeRow(ri)}
                  className="px-2 py-2 text-gray-700 hover:text-red-400 transition-colors text-xs"
                  title="Remove row"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-1.5 bg-gray-900/50 border-t border-gray-800">
        <button
          onClick={addRow}
          className="text-xs text-gray-600 hover:text-green-400 transition-colors"
        >
          + Add row
        </button>
      </div>
    </div>
  )
}
