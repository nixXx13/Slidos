import React from 'react'
import TextElement from './TextElement'
import TableElement from './TableElement'
import CodeElement from './CodeElement'

export default function SlideElement({ element, locked, onUpdate, onDelete, onMoveUp, onMoveDown }) {
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

      {/* Controls — only when page is unlocked */}
      {!locked && (
        <div className="absolute bottom-full right-0 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10 flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={!onMoveUp}
            title="Move up"
            className="px-2 py-1 rounded-md text-xs bg-white text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 border border-gray-200 shadow-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={!onMoveDown}
            title="Move down"
            className="px-2 py-1 rounded-md text-xs bg-white text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 border border-gray-200 shadow-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ↓
          </button>
          <button
            onClick={onDelete}
            title="Delete element"
            className="px-2 py-1 rounded-md text-xs bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 shadow-sm transition-colors"
          >
            ✕ Remove
          </button>
        </div>
      )}
    </div>
  )
}
