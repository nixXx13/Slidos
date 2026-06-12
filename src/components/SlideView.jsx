import React, { useState, useEffect } from 'react'
import SlideElement from './SlideElement'

const genId = () => Math.random().toString(36).slice(2, 10)

const NEW_ELEMENT = {
  text: () => ({ id: genId(), type: 'text', content: 'New text element' }),
  table: () => ({
    id: genId(),
    type: 'table',
    headers: ['Column 1', 'Column 2'],
    rows: [['', '']],
  }),
  code: () => ({
    id: genId(),
    type: 'code',
    language: 'javascript',
    code: '// Your code here\nconsole.log("Hello, World!")',
  }),
}

export default function SlideView({ slide, onUpdate }) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [pageUnlocked, setPageUnlocked] = useState(false)

  useEffect(() => {
    setPageUnlocked(false)
  }, [slide.id])

  const togglePageLock = () => setPageUnlocked((v) => !v)

  const updateElement = (id, updated) =>
    onUpdate({ ...slide, elements: slide.elements.map((el) => (el.id === id ? updated : el)) })

  const deleteElement = (id) =>
    onUpdate({ ...slide, elements: slide.elements.filter((el) => el.id !== id) })

  const moveElement = (id, dir) => {
    const els = [...slide.elements]
    const i = els.findIndex((el) => el.id === id)
    const j = i + dir
    if (j < 0 || j >= els.length) return
    ;[els[i], els[j]] = [els[j], els[i]]
    onUpdate({ ...slide, elements: els })
  }

  const addElement = (type) =>
    onUpdate({ ...slide, elements: [...slide.elements, NEW_ELEMENT[type]()] })

  return (
    /* Viewport background */
    <div className="h-full flex justify-center items-start bg-slate-100 p-6 overflow-hidden">
      {/* Slide card */}
      <div className="relative w-full max-w-4xl h-full bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07),0_1px_4px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden border border-gray-100">

        {/* Page-level lock button */}
        <button
          onClick={togglePageLock}
          title={pageUnlocked ? 'Lock slide' : 'Unlock to edit'}
          className={`absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            pageUnlocked
              ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100'
              : 'bg-gray-50 text-gray-400 border border-gray-200 hover:text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>{pageUnlocked ? '🔓' : '🔒'}</span>
          <span>{pageUnlocked ? 'Editing' : 'Locked'}</span>
        </button>

        {/* Title */}
        <div className="px-10 pt-8 pb-4 flex-shrink-0 border-b border-gray-100">
          {editingTitle && pageUnlocked ? (
            <input
              autoFocus
              value={slide.title}
              onChange={(e) => onUpdate({ ...slide, title: e.target.value })}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => { if (e.key === 'Enter') setEditingTitle(false) }}
              className="w-full bg-transparent text-3xl font-semibold text-gray-900 outline-none border-b-2 border-indigo-400 pb-1 pr-24"
            />
          ) : (
            <h1
              className={`text-3xl font-semibold text-gray-900 pr-24 ${pageUnlocked ? 'cursor-text hover:text-indigo-600 transition-colors' : ''}`}
              onClick={() => pageUnlocked && setEditingTitle(true)}
            >
              {slide.title || <span className="text-gray-300 font-normal italic">Untitled slide</span>}
            </h1>
          )}
        </div>

        {/* Elements */}
        <div className="flex-1 overflow-y-auto px-10 py-6 space-y-4">
          {slide.elements.map((element, i) => (
            <SlideElement
              key={element.id}
              element={element}
              locked={!pageUnlocked}
              onUpdate={(updated) => updateElement(element.id, updated)}
              onDelete={() => deleteElement(element.id)}
              onMoveUp={i > 0 ? () => moveElement(element.id, -1) : null}
              onMoveDown={i < slide.elements.length - 1 ? () => moveElement(element.id, 1) : null}
            />
          ))}

          {/* Add element row — only when unlocked */}
          {pageUnlocked && (
            <div className="flex items-center gap-2 pt-2 group">
              <div className="flex-1 h-px bg-gray-100 group-hover:bg-gray-200 transition-colors" />
              <div className="flex gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="text-gray-400 text-xs self-center">Add:</span>
                {['text', 'table', 'code'].map((type) => (
                  <button
                    key={type}
                    onClick={() => addElement(type)}
                    className="px-2.5 py-1 text-xs rounded-md border border-gray-200 bg-white text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors font-medium shadow-sm"
                  >
                    + {type}
                  </button>
                ))}
              </div>
              <div className="flex-1 h-px bg-gray-100 group-hover:bg-gray-200 transition-colors" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
