import React from 'react'
import TextElement from './TextElement'
import TableElement from './TableElement'
import CodeElement from './CodeElement'

export default function SlideElement({ element, locked, onUpdate, onDelete }) {
  const renderElement = () => {
    switch (element.type) {
      case 'text':
        return <TextElement element={element} locked={locked} onUpdate={onUpdate} />
      case 'table':
        return <TableElement element={element} locked={locked} onUpdate={onUpdate} />
      case 'code':
        return <CodeElement element={element} locked={locked} onUpdate={onUpdate} />
      default:
        return <div className="text-red-400 text-sm">Unknown element type: {element.type}</div>
    }
  }

  return (
    <div className="relative group">
      {renderElement()}

      {/* Delete button — only when page is unlocked (locked=false) */}
      {!locked && (
        <div className="absolute bottom-full right-0 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
          <button
            onClick={onDelete}
            title="Delete element"
            className="px-2 py-1 rounded text-xs bg-gray-800/90 text-gray-600 hover:text-red-400 hover:bg-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
