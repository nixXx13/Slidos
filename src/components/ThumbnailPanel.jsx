import React, { useState, useRef, useEffect } from 'react'

const TYPE_CHIP = {
  text: { label: 'T', bg: 'bg-indigo-100 text-indigo-500' },
  table: { label: '⊞', bg: 'bg-emerald-100 text-emerald-600' },
  code: { label: '</>', bg: 'bg-amber-100 text-amber-600' },
}

const Thumbnail = React.forwardRef(function Thumbnail(
  { slide, index, isCurrent, isDragOver, onNavigate, onDragStart, onDragOver, onDrop, onDragEnd },
  ref
) {
  return (
    <div
      ref={ref}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      onClick={() => onNavigate(index)}
      className={`
        flex-shrink-0 w-36 h-24 rounded-lg border-2 cursor-pointer select-none
        flex flex-col p-2 gap-1 transition-all duration-150
        ${isCurrent
          ? 'border-indigo-500 shadow-md bg-white'
          : isDragOver
          ? 'border-indigo-300 bg-indigo-50 scale-105'
          : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-gray-400 font-medium tabular-nums leading-none">{index + 1}</span>
        <span className="text-xs font-semibold text-gray-700 truncate leading-none flex-1">{slide.title || 'Untitled'}</span>
      </div>
      <div className="flex flex-wrap gap-0.5">
        {slide.elements.slice(0, 4).map((el) => {
          const chip = TYPE_CHIP[el.type]
          return chip ? (
            <span key={el.id} className={`text-[9px] font-medium px-1 py-0.5 rounded ${chip.bg}`}>
              {chip.label}
            </span>
          ) : null
        })}
        {slide.elements.length > 4 && (
          <span className="text-[9px] text-gray-400">+{slide.elements.length - 4}</span>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        {slide.elements.slice(0, 2).map((el) => (
          <div key={el.id} className="text-[9px] text-gray-400 truncate leading-tight">
            {el.type === 'text'
              ? (el.content || '').replace(/<[^>]*>/g, '').slice(0, 40) || '—'
              : el.type === 'table'
              ? el.headers?.join(' · ').slice(0, 40)
              : el.code?.split('\n')[0]?.slice(0, 40) || ''}
          </div>
        ))}
      </div>
    </div>
  )
})

export default function ThumbnailPanel({ slides, currentIndex, onNavigate, onReorder }) {
  const [dragIndex, setDragIndex] = useState(null)
  const [dropIndex, setDropIndex] = useState(null)
  const panelRef = useRef(null)
  const currentRef = useRef(null)

  useEffect(() => {
    if (currentRef.current && panelRef.current) {
      const panel = panelRef.current
      const el = currentRef.current
      panel.scrollLeft = el.offsetLeft - panel.offsetWidth / 2 + el.offsetWidth / 2
    }
  }, [currentIndex])

  const handleDragStart = (e, index) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (index !== dropIndex) setDropIndex(index)
  }

  const handleDrop = (e, index) => {
    e.preventDefault()
    if (dragIndex !== null && dragIndex !== index) {
      onReorder(dragIndex, index)
    }
    setDragIndex(null)
    setDropIndex(null)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setDropIndex(null)
  }

  return (
    <div
      ref={panelRef}
      className="bg-white border-t border-gray-200 px-4 py-2 flex items-center gap-2 overflow-x-auto scroll-smooth"
    >
      {slides.map((slide, i) => (
        <Thumbnail
          key={slide.id}
          ref={i === currentIndex ? currentRef : null}
          slide={slide}
          index={i}
          isCurrent={i === currentIndex}
          isDragOver={dropIndex === i && dragIndex !== i}
          onNavigate={onNavigate}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
        />
      ))}
    </div>
  )
}
