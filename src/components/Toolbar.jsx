import React, { useRef } from 'react'

export default function Toolbar({ onAddSlide, onDuplicateSlide, onDeleteSlide, onExport, onImport, slideCount, locked, onToggleLock }) {
  const fileInputRef = useRef()

  return (
    <div className="flex items-center gap-2 px-5 py-2.5 bg-white border-b border-gray-200 select-none">
      <span className="text-indigo-600 font-semibold text-base tracking-tight mr-3">OverReact</span>

      <div className="w-px h-4 bg-gray-200" />

      <button
        onClick={onAddSlide}
        className="px-3 py-1.5 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors text-xs font-medium"
      >
        + New Slide
      </button>

      <button
        onClick={onDuplicateSlide}
        className="px-3 py-1.5 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors text-xs font-medium"
      >
        Duplicate Slide
      </button>

      {slideCount > 1 && (
        <button
          onClick={onDeleteSlide}
          className="px-3 py-1.5 rounded-md bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors text-xs font-medium"
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
          onClick={onToggleLock}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
            locked
              ? 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-gray-800'
              : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
          }`}
          title={locked ? 'Unlock to edit' : 'Lock slides'}
        >
          {locked ? '🔒 Locked' : '🔓 Editing'}
        </button>
        <button
          onClick={() => fileInputRef.current.click()}
          className="px-3 py-1.5 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors text-xs font-medium"
        >
          Import JSON
        </button>
        <button
          onClick={onExport}
          className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-xs font-medium shadow-sm"
        >
          Export JSON
        </button>
      </div>
    </div>
  )
}
