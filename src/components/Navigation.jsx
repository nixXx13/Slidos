import React from 'react'

export default function Navigation({ current, total, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between px-6 py-2.5 bg-white border-t border-gray-200 select-none">
      <button
        onClick={onPrev}
        disabled={current === 0}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 hover:text-gray-900 transition-colors text-base leading-none"
        title="Previous (←)"
      >
        ←
      </button>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-200 ${
              i === current
                ? 'w-5 h-2 bg-indigo-500'
                : 'w-2 h-2 bg-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-xs text-gray-400 font-medium tabular-nums">
          {current + 1} / {total}
        </span>
      </div>

      <button
        onClick={onNext}
        disabled={current === total - 1}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 hover:text-gray-900 transition-colors text-base leading-none"
        title="Next (→)"
      >
        →
      </button>
    </div>
  )
}
