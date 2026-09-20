import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { Experiment1 } from './components/Experiment1'
import { Experiment2 } from './components/Experiment2'
import { Experiment3 } from './components/Experiment3'
import { Experiment4 } from './components/Experiment4'

interface Chapter {
  title: string
  Component: ComponentType<{ onComplete?: () => void }>
}

const chapters: Chapter[] = [
  { title: 'One clock', Component: Experiment1 },
  { title: 'Two clocks at rest', Component: Experiment2 },
  { title: 'A moving clock', Component: Experiment3 },
  { title: 'A light clock', Component: Experiment4 },
]

const STORAGE_KEY = 'spacetime-explorer-progress'

interface Progress {
  currentChapter: number
  completed: number[]
}

function isChapterIndex(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) < chapters.length
}

function loadProgress(): Progress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        currentChapter: isChapterIndex(parsed.currentChapter) ? parsed.currentChapter : 0,
        completed: Array.isArray(parsed.completed) ? parsed.completed.filter(isChapterIndex) : [],
      }
    }
  } catch {
    // Storage unavailable or corrupt: start fresh.
  }
  return { currentChapter: 0, completed: [] }
}

function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Progress simply won't persist.
  }
}

const navButtonStyle = (disabled: boolean) => ({
  padding: '0.5rem 1rem',
  fontSize: '1rem',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
})

export function App() {
  const [initialProgress] = useState(loadProgress)
  const [currentChapter, setCurrentChapter] = useState(initialProgress.currentChapter)
  const [completed, setCompleted] = useState<number[]>(initialProgress.completed)

  useEffect(() => {
    saveProgress({ currentChapter, completed })
  }, [currentChapter, completed])

  const markComplete = (index: number) => {
    setCompleted((previous) => (previous.includes(index) ? previous : [...previous, index]))
  }

  const { Component } = chapters[currentChapter]
  const isFirst = currentChapter === 0
  const isLast = currentChapter === chapters.length - 1

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>
          How Clocks Measure Time
        </h1>
        <p style={{ textAlign: 'center', color: '#666', maxWidth: '800px', margin: '0 auto 2rem' }}>
          A short sequence of experiments on time. Each one builds on the one before it.
        </p>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          <nav
            aria-label="Experiments"
            style={{ flex: '0 0 220px', position: 'sticky', top: '2rem' }}
          >
            <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {chapters.map((chapter, index) => {
                const isCurrent = index === currentChapter
                const isCompleted = completed.includes(index)
                return (
                  <li key={chapter.title} style={{ marginBottom: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setCurrentChapter(index)}
                      aria-current={isCurrent ? 'step' : undefined}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        border: isCurrent ? '2px solid #333' : '1px solid #ccc',
                        borderRadius: '6px',
                        backgroundColor: isCurrent ? '#fff' : 'transparent',
                        fontWeight: isCurrent ? 600 : 400,
                      }}
                    >
                      {index + 1}. {chapter.title}
                      {isCompleted && (
                        <span aria-label="completed" style={{ float: 'right', color: '#2e7d32' }}>
                          ✓
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ol>
          </nav>

          <main style={{ flex: '1 1 0', minWidth: 0 }}>
            <Component key={currentChapter} onComplete={() => markComplete(currentChapter)} />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '2rem',
              }}
            >
              <button
                type="button"
                disabled={isFirst}
                onClick={() => setCurrentChapter(currentChapter - 1)}
                style={navButtonStyle(isFirst)}
              >
                ← Previous
              </button>
              <button
                type="button"
                disabled={isLast}
                onClick={() => setCurrentChapter(currentChapter + 1)}
                style={navButtonStyle(isLast)}
              >
                Next →
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
