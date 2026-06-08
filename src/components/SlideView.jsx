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

  // Reset to locked when navigating to a different slide
  useEffect(() => {
    setPageUnlocked(false)
  }, [slide.id])

  const togglePageLock = () => setPageUnlocked((v) => !v)

  const updateElement = (id, updated) =>
    onUpdate({ ...slide, elements: slide.elements.map((el) => (el.id === id ? updated : el)) })

  const deleteElement = (id) =>
    onUpdate({ ...slide, elements: slide.elements.filter((el) => el.id !== id) })

  const addElement = (type) =>
    onUpdate({ ...slide, elements: [...slide.elements, NEW_ELEMENT[type]()] })

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* Page-level lock toggle — top right corner */}
      <button
        onClick={togglePageLock}
        title={pageUnlocked ? 'Lock slide (exit edit mode)' : 'Unlock slide to edit'}
        className={`absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono transition-all ${
          pageUnlocked
            ? 'bg-yellow-900/70 text-yellow-400 border border-yellow-700/50 hover:bg-yellow-800/70'
            : 'bg-gray-800/60 text-gray-600 border border-gray-700/40 hover:text-gray-400 hover:bg-gray-800'
        }`}
      >
        <span>{pageUnlocked ? '🔓' : '🔒'}</span>
        <span>{pageUnlocked ? 'editing' : 'locked'}</span>
      </button>

      {/* Slide title */}
      <div className="px-12 pt-8 pb-5 flex-shrink-0">
        {editingTitle ? (
          <input
            autoFocus
            value={slide.title}
            onChange={(e) => onUpdate({ ...slide, title: e.target.value })}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => { if (e.key === 'Enter') setEditingTitle(false) }}
            className="w-full bg-transparent text-3xl font-bold text-white outline-none border-b-2 border-green-500 pb-1 font-mono"
          />
        ) : (
          <h1
            className="text-3xl font-bold text-white cursor-text hover:text-green-300 transition-colors font-mono group"
            onClick={() => setEditingTitle(true)}
            title="Click to edit title"
          >
            {slide.title || <span className="text-gray-600 italic font-normal">Untitled slide</span>}
            <span className="ml-2 text-base text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity font-normal">✎</span>
          </h1>
        )}
      </div>

      {/* Elements */}
      <div className="flex-1 overflow-y-auto px-12 pb-6 space-y-4">
        {slide.elements.map((element) => (
          <SlideElement
            key={element.id}
            element={element}
            locked={!pageUnlocked}
            onUpdate={(updated) => updateElement(element.id, updated)}
            onDelete={() => deleteElement(element.id)}
          />
        ))}

        {/* Add element row — only available when page is unlocked */}
        <div className={`flex items-center gap-2 pt-1 group ${!pageUnlocked ? 'hidden' : ''}`}>
          <div className="flex-1 h-px bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-gray-700 text-xs font-mono self-center">add:</span>
            {['text', 'table', 'code'].map((type) => (
              <button
                key={type}
                onClick={() => addElement(type)}
                className="px-2.5 py-1 text-xs rounded border border-gray-700 bg-gray-900 text-gray-500 hover:text-green-400 hover:border-green-800 transition-colors font-mono"
              >
                + {type}
              </button>
            ))}
          </div>
          <div className="flex-1 h-px bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  )
}
