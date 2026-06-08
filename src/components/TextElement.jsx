import React from 'react'

export default function TextElement({ element, locked, onUpdate }) {
  if (locked) {
    return (
      <div className="py-1 text-gray-200 whitespace-pre-wrap leading-relaxed text-base min-h-[1.5rem]">
        {element.content || <span className="text-gray-600 italic">Empty text</span>}
      </div>
    )
  }

  return (
    <textarea
      value={element.content}
      onChange={(e) => onUpdate({ ...element, content: e.target.value })}
      className="w-full min-h-[6rem] bg-gray-900 border border-green-700 rounded p-3 text-gray-200 text-base resize-y outline-none focus:border-green-500 font-mono leading-relaxed"
      placeholder="Enter text..."
      autoFocus
    />
  )
}
