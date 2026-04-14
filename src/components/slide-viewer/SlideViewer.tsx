'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Grid3x3,
  Loader2,
  Download,
} from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

interface SlideViewerProps {
  pdfUrl: string
  title?: string
  allowDownload?: boolean
  onLastSlide?: () => void
}

export function SlideViewer({ pdfUrl, title, allowDownload = false, onLastSlide }: SlideViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [loading, setLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showThumbnails, setShowThumbnails] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const resize = () => setContainerWidth(containerRef.current?.clientWidth ?? 0)
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setCurrentPage((p) => Math.max(1, p - 1))
  }, [])

  const goNext = useCallback(() => {
    setDirection(1)
    setCurrentPage((p) => {
      const next = Math.min(numPages, p + 1)
      if (next === numPages && p !== numPages) onLastSlide?.()
      return next
    })
  }, [numPages, onLastSlide])

  const goToPage = useCallback((page: number) => {
    setDirection(page > currentPage ? 1 : -1)
    setCurrentPage(page)
    if (page === numPages) onLastSlide?.()
  }, [currentPage, numPages, onLastSlide])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev, isFullscreen])

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isFullscreen])

  const pageWidth = containerWidth > 0
    ? Math.min(containerWidth - (showThumbnails ? 200 : 0), 1200)
    : 800

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
      scale: 0.98,
    }),
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-gradient-to-br from-[#1a1a1a] via-[#2a1a3a] to-[#1a1a1a] ${
        isFullscreen
          ? 'fixed inset-0 z-[100]'
          : 'w-full rounded-2xl overflow-hidden border border-[#D9D9D9]'
      }`}
      style={isFullscreen ? {} : { minHeight: '600px' }}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-3 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          {title && (
            <p className="text-white/90 text-sm font-semibold truncate max-w-[40vw]">{title}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-semibold tabular-nums">
            {currentPage} / {numPages || '—'}
          </div>

          <button
            onClick={() => setShowThumbnails((v) => !v)}
            className={`h-9 w-9 flex items-center justify-center rounded-full backdrop-blur-md border transition-colors ${
              showThumbnails
                ? 'bg-[#9E50E5] border-[#9E50E5] text-white'
                : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
            }`}
            aria-label="Toggle slide thumbnails"
            title="Toggle thumbnails"
          >
            <Grid3x3 className="h-4 w-4" />
          </button>

          {allowDownload && (
            <a
              href={pdfUrl}
              download
              className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Download slide deck"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </a>
          )}

          <button
            onClick={() => setIsFullscreen((v) => !v)}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen (F)'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Progress bar (top) */}
      <div className="absolute top-0 left-0 right-0 z-10 h-0.5 bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-[#9E50E5] to-[#C084FC]"
          initial={{ width: 0 }}
          animate={{ width: numPages > 0 ? `${(currentPage / numPages) * 100}%` : '0%' }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>

      {/* Main viewer + optional thumbnails */}
      <div className={`flex h-full ${isFullscreen ? 'h-screen' : ''}`}>

        {/* Thumbnails sidebar */}
        <AnimatePresence initial={false}>
          {showThumbnails && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 180, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="shrink-0 overflow-hidden border-r border-white/10"
            >
              <div className="w-[180px] h-full overflow-y-auto py-16 px-3 space-y-2 scrollbar-thin">
                <Document file={pdfUrl} loading={null}>
                  {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`block w-full rounded-lg overflow-hidden border-2 transition-all ${
                        p === currentPage
                          ? 'border-[#9E50E5] shadow-[0_0_0_3px_rgba(158,80,229,0.25)]'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="relative">
                        <Page
                          pageNumber={p}
                          width={150}
                          renderAnnotationLayer={false}
                          renderTextLayer={false}
                          loading={
                            <div className="w-[150px] aspect-[4/3] bg-white/5 flex items-center justify-center">
                              <Loader2 className="h-3 w-3 animate-spin text-white/40" />
                            </div>
                          }
                        />
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold tabular-nums">
                          {p}
                        </div>
                      </div>
                    </button>
                  ))}
                </Document>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Slide canvas */}
        <div className="flex-1 flex items-center justify-center relative py-16 px-4">
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages)
              setLoading(false)
            }}
            onLoadError={(err) => {
              console.error('PDF load error:', err)
              setLoading(false)
            }}
            loading={
              <div className="flex items-center gap-3 text-white/70">
                <Loader2 className="h-5 w-5 animate-spin text-[#9E50E5]" />
                <span className="text-sm">Loading slides...</span>
              </div>
            }
          >
            {!loading && numPages > 0 && (
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentPage}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: 'spring', stiffness: 260, damping: 28 },
                    opacity: { duration: 0.25 },
                    scale: { duration: 0.35, ease: 'easeOut' },
                  }}
                  className="shadow-2xl shadow-black/50 rounded-lg overflow-hidden bg-white"
                >
                  <Page
                    pageNumber={currentPage}
                    width={pageWidth}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                  />
                </motion.div>
              </AnimatePresence>
            )}
          </Document>

          {/* Side arrows */}
          {currentPage > 1 && (
            <button
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-[#9E50E5] hover:border-[#9E50E5] transition-all hover:scale-110"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {currentPage < numPages && (
            <button
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-[#9E50E5] hover:border-[#9E50E5] transition-all hover:scale-110"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom bar: dot navigation + hint */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-5 py-4 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-between">
        <p className="text-white/50 text-xs hidden md:block">
          Use <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 text-[10px] font-mono">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 text-[10px] font-mono">→</kbd> to navigate · <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 text-[10px] font-mono">F</kbd> fullscreen
        </p>

        {/* Dot pagination (only if ≤ 20 slides to avoid clutter) */}
        {numPages > 0 && numPages <= 20 && (
          <div className="flex items-center gap-1.5 mx-auto md:mx-0">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`h-1.5 rounded-full transition-all ${
                  p === currentPage
                    ? 'w-6 bg-[#9E50E5]'
                    : 'w-1.5 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${p}`}
              />
            ))}
          </div>
        )}

        {numPages > 20 && <div />}
      </div>
    </div>
  )
}
