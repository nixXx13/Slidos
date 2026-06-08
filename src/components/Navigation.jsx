import React from 'react'

export default function Navigation({ current, total, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between px-6 py-2.5 bg-gray-900/80 border-t border-gray-800 select-none">
      <button
        onClick={onPrev}
        disabled={current === 0}
        className="px-4 py-1.5 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-25 disabled:cursor-not-allowed text-gray-300 hover:text-white transition-colors text-base font-mono"
        title="Previous slide (←)"
      >
        ←
      </button>

      <div className="flex items-center gap-2">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-200 ${
              i === current
                ? 'w-5 h-2 bg-green-400'
                : 'w-2 h-2 bg-gray-700 hover:bg-gray-500 cursor-pointer'
            }`}
          />
        ))}
        <span className="ml-2 text-xs text-gray-600 font-mono">
          {current + 1} / {total}
        </span>
      </div>

      <button
        onClick={onNext}
        disabled={current === total - 1}
        className="px-4 py-1.5 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-25 disabled:cursor-not-allowed text-gray-300 hover:text-white transition-colors text-base font-mono"
        title="Next slide (→)"
      >
        →
      </button>
    </div>
  )
}
