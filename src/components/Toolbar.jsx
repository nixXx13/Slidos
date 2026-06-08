import React, { useRef } from 'react'

export default function Toolbar({ onAddSlide, onDeleteSlide, onExport, onImport, slideCount }) {
  const fileInputRef = useRef()

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-800 text-sm select-none">
      <span className="text-green-400 font-bold tracking-tight mr-3 font-mono">
        OverReact
      </span>

      <div className="w-px h-4 bg-gray-700" />

      <button
        onClick={onAddSlide}
        className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors text-xs font-mono"
      >
        + New Slide
      </button>

      {slideCount > 1 && (
        <button
          onClick={onDeleteSlide}
          className="px-3 py-1 rounded bg-gray-800 hover:bg-red-900/60 text-gray-500 hover:text-red-400 transition-colors text-xs font-mono"
        >
          Delete Slide
        </button>
      )}

      <div className="ml-auto flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            if (e.target.files[0]) {
              onImport(e.target.files[0])
              e.target.value = ''
            }
          }}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors text-xs font-mono"
        >
          Import JSON
        </button>
        <button
          onClick={onExport}
          className="px-3 py-1 rounded bg-green-900/70 hover:bg-green-800/80 text-green-400 hover:text-green-200 border border-green-800/50 transition-colors text-xs font-mono"
        >
          Export JSON
        </button>
      </div>
    </div>
  )
}
