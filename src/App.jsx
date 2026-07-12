import React, { useState, useEffect, useCallback } from 'react'
import SlideView from './components/SlideView'
import Navigation from './components/Navigation'
import Toolbar from './components/Toolbar'
import ThumbnailPanel from './components/ThumbnailPanel'
import { defaultSlides } from './utils/defaultSlides'
import contentSlides from './content/content.json'

const genId = () => Math.random().toString(36).slice(2, 10)

const initialSlides = Array.isArray(contentSlides) && contentSlides.length > 0
  ? contentSlides
  : defaultSlides

export default function App() {
  const [slides, setSlides] = useState(initialSlides)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [locked, setLocked] = useState(true)

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, slides.length - 1))
  }, [slides.length])

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0))
  }, [])

  // Keyboard navigation — guard against firing when an editable element is focused
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target
      if (
        t.tagName === 'TEXTAREA' ||
        t.tagName === 'INPUT' ||
        t.isContentEditable ||
        t.closest?.('.monaco-editor')
      ) return

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev])

  const updateSlide = (index, updated) =>
    setSlides((prev) => prev.map((s, i) => (i === index ? updated : s)))

  const addSlide = () => {
    const newSlide = {
      id: genId(),
      title: `Slide ${slides.length + 1}`,
      elements: [{ id: genId(), type: 'text', content: 'New slide' }],
    }
    setSlides((prev) => [...prev, newSlide])
    setCurrentIndex(slides.length)
  }

  const duplicateCurrentSlide = () => {
    const source = slides[currentIndex]
    const copy = {
      ...source,
      id: genId(),
      title: `${source.title} (copy)`,
      elements: source.elements.map((el) => ({ ...el, id: genId() })),
    }
    setSlides((prev) => {
      const next = [...prev]
      next.splice(currentIndex + 1, 0, copy)
      return next
    })
    setCurrentIndex(currentIndex + 1)
  }

  const reorderSlides = (fromIndex, toIndex) => {
    setSlides((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
    setCurrentIndex((ci) => {
      if (ci === fromIndex) return toIndex
      if (fromIndex < ci && toIndex >= ci) return ci - 1
      if (fromIndex > ci && toIndex <= ci) return ci + 1
      return ci
    })
  }

  const deleteCurrentSlide = () => {
    if (slides.length === 1) return
    const newIndex = Math.min(currentIndex, slides.length - 2)
    setSlides((prev) => prev.filter((_, i) => i !== currentIndex))
    setCurrentIndex(newIndex)
  }

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(slides, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'overreact-slides.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJSON = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        const parsed = Array.isArray(data) ? data : data.slides
        if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('No slides found')
        setSlides(parsed)
        setCurrentIndex(0)
      } catch (err) {
        alert(`Import failed: ${err.message}`)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-gray-900 overflow-hidden">
      {!locked ? (
        <Toolbar
          onAddSlide={addSlide}
          onDuplicateSlide={duplicateCurrentSlide}
          onDeleteSlide={deleteCurrentSlide}
          onExport={exportJSON}
          onImport={importJSON}
          slideCount={slides.length}
          locked={locked}
          onToggleLock={() => setLocked((v) => !v)}
        />
      ) : (
        <button
          onClick={() => setLocked(false)}
          className="absolute top-3 right-4 z-50 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-400 border border-gray-200 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="Unlock to edit"
        >
          🔒 Locked
        </button>
      )}

      <div className="flex-1 overflow-hidden">
        <SlideView
          slide={slides[currentIndex]}
          locked={locked}
          onUpdate={(updated) => updateSlide(currentIndex, updated)}
        />
      </div>

      {!locked && (
        <ThumbnailPanel
          slides={slides}
          currentIndex={currentIndex}
          onNavigate={setCurrentIndex}
          onReorder={reorderSlides}
        />
      )}

      <Navigation
        current={currentIndex}
        total={slides.length}
        onPrev={goPrev}
        onNext={goNext}
      />
    </div>
  )
}
