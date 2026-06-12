import React, { useState, useEffect, useCallback } from 'react'
import SlideView from './components/SlideView'
import Navigation from './components/Navigation'
import Toolbar from './components/Toolbar'
import { defaultSlides } from './utils/defaultSlides'

const genId = () => Math.random().toString(36).slice(2, 10)

export default function App() {
  const [slides, setSlides] = useState(defaultSlides)
  const [currentIndex, setCurrentIndex] = useState(0)

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
      <Toolbar
        onAddSlide={addSlide}
        onDuplicateSlide={duplicateCurrentSlide}
        onDeleteSlide={deleteCurrentSlide}
        onExport={exportJSON}
        onImport={importJSON}
        slideCount={slides.length}
      />

      <div className="flex-1 overflow-hidden">
        <SlideView
          slide={slides[currentIndex]}
          onUpdate={(updated) => updateSlide(currentIndex, updated)}
        />
      </div>

      <Navigation
        current={currentIndex}
        total={slides.length}
        onPrev={goPrev}
        onNext={goNext}
      />
    </div>
  )
}
