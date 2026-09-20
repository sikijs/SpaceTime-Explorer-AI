import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { Experiment1 } from './components/Experiment1'
import { Experiment2 } from './components/Experiment2'
import { Experiment3 } from './components/Experiment3'
import { Experiment4 } from './components/Experiment4'

interface Chapter {
  title: string
  Component: ComponentType<{ onComplete?: () => void }>
  // Shown below the experiment once the learner has run it to the end.
  learned: string
  next: string
}

const chapters: Chapter[] = [
  {
    title: 'One clock',
    Component: Experiment1,
    learned:
      "A clock measures the time that passes between two events, here the start and the end of the experiment. That elapsed time is the difference between the clock's readings at those two events.",
    next: 'You used one clock. Next, two clocks in two different places measure the same two events. Will they agree?',
  },
  {
    title: 'Two clocks at rest',
    Component: Experiment2,
    learned:
      'Two clocks at rest in the same reference frame, set to the same reading at the start, measured the same elapsed time between the same two events.',
    next: 'So far, nothing has moved. Next, one clock moves relative to the lab. Will it still agree with the clocks at rest?',
  },
  {
    title: 'A moving clock',
    Component: Experiment3,
    learned:
      'When a clock moves relative to the lab, it measures less elapsed time than the lab clock between the same two events. The faster it moves, the bigger the difference. The moving clock is not broken: the elapsed time between events depends on the reference frame and on motion. (At speed 0 nothing moves, and the two clocks agree.)',
    next: 'Why does the moving clock measure less time? Next, we look inside a clock to find the reason.',
  },
  {
    title: 'A light clock',
    Component: Experiment4,
    learned:
      "Light travels at the same speed in the lab frame for both light clocks. The moving clock's light pulse follows a longer, diagonal path in the lab frame, so each of its ticks takes longer in lab time. That is why the moving clock measures less time than the lab clock, by the same factor you saw in Experiment 3.",
    next: 'These are all the experiments for now. You can go back to any chapter and run it again.',
  },
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

  const { Component, learned, next } = chapters[currentChapter]
  const isCurrentCompleted = completed.includes(currentChapter)
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
                        fontWeight: isCurrent ? 700 : 500,
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

            {!isCurrentCompleted && (
              <p
                style={{
                  maxWidth: '700px',
                  margin: '1rem auto 0',
                  padding: '0.75rem 1.5rem',
                  borderLeft: '4px dashed #bbb',
                  fontSize: '0.875rem',
                  color: '#666',
                }}
              >
                When you finish this experiment, a short summary of what you learned and what comes
                next will appear here.
              </p>
            )}

            {isCurrentCompleted && (
              <section
                aria-label="Chapter summary"
                style={{
                  maxWidth: '700px',
                  margin: '1rem auto 0',
                  padding: '1rem 1.5rem',
                  borderLeft: '4px solid #2e7d32',
                  backgroundColor: '#eef6ee',
                  color: '#333',
                }}
              >
                <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                  <strong>What you learned.</strong> {learned}
                </p>
                <p style={{ marginTop: 0, marginBottom: 0 }}>
                  <strong>What's next.</strong> {next}
                </p>
              </section>
            )}

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
