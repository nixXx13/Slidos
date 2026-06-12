import React, { useRef, useEffect } from 'react'

export default function TextElement({ element, locked, onUpdate }) {
  const editorRef = useRef(null)

  useEffect(() => {
    if (!locked && editorRef.current) {
      editorRef.current.innerHTML = element.content || ''
    }
  }, [locked]) // re-initialize whenever the editor becomes visible

  const execFormat = (command) => {
    document.execCommand(command, false, null)
    editorRef.current?.focus()
  }

  const handleInput = () => {
    onUpdate({ ...element, content: editorRef.current.innerHTML })
  }

  if (locked) {
    return element.content ? (
      <div
        className="py-1 text-gray-700 leading-relaxed text-base min-h-[1.5rem]"
        dangerouslySetInnerHTML={{ __html: element.content }}
      />
    ) : (
      <div className="py-1 text-base min-h-[1.5rem]">
        <span className="text-gray-300 italic">Empty text</span>
      </div>
    )
  }

  return (
    <div className="border border-indigo-300 rounded-lg overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-shadow">
      <div className="flex gap-1 px-2 py-1.5 bg-gray-50 border-b border-indigo-100">
        <button
          onMouseDown={(e) => { e.preventDefault(); execFormat('bold') }}
          className="w-7 h-7 rounded text-sm font-bold text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
          title="Bold"
        >
          B
        </button>
        <button
          onMouseDown={(e) => { e.preventDefault(); execFormat('italic') }}
          className="w-7 h-7 rounded text-sm italic text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
          title="Italic"
        >
          I
        </button>
        <button
          onMouseDown={(e) => { e.preventDefault(); execFormat('underline') }}
          className="w-7 h-7 rounded text-sm underline text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
          title="Underline"
        >
          U
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="w-full min-h-[6rem] bg-white p-3 text-gray-800 text-base outline-none leading-relaxed"
      />
    </div>
  )
}
