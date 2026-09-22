import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { Welcome } from './components/Welcome'
import { Experiment1 } from './components/Experiment1'
import { Experiment2 } from './components/Experiment2'
import { Experiment3 } from './components/Experiment3'
import { Experiment4 } from './components/Experiment4'
import { Experiment5 } from './components/Experiment5'
import { Experiment6 } from './components/Experiment6'
import { Experiment7 } from './components/Experiment7'

interface Chapter {
  title: string
  Component: ComponentType<{ onComplete?: () => void; onTutorComplete?: () => void }>
  // Shown below the experiment once the learner has run it and finished the tutor's questions.
  learned: string
  next: string
}

const chapters: Chapter[] = [
  {
    title: 'One clock',
    Component: Experiment1,
    learned:
      "A clock measures how much time passes between two events. Here, the two events were the start and the end of the experiment. The elapsed time is the difference between the clock's two readings.",
    next: 'You used one clock. Next, two clocks in two different places will measure the same two events. Will they agree?',
  },
  {
    title: 'Two clocks at rest',
    Component: Experiment2,
    learned:
      'Two clocks standing still in the same reference frame, set to the same reading at the start, measured the same elapsed time between the same two events.',
    next: 'So far, nothing has moved. Next, one clock moves compared with the lab. Will it still agree with the clocks that stand still?',
  },
  {
    title: 'A moving clock',
    Component: Experiment3,
    learned:
      'When a clock moves compared with the lab, it measures less elapsed time than the lab clock between the same two events. This effect is called time dilation. The faster the clock moves, the bigger the difference. The moving clock is not broken: the time that passes between two events depends on who is measuring (their reference frame) and how they are moving. (At speed 0 nothing moves, and the two clocks agree.)',
    next: 'Why does time dilation happen? Next, we look inside a clock to find the reason.',
  },
  {
    title: 'Why time dilation happens',
    Component: Experiment4,
    learned:
      "In the lab, light travels at the same speed for both light clocks. The moving clock's pulse of light has a longer, slanted path to travel, so each of its ticks takes longer on the lab's clocks. That is why the moving clock measures less time than the lab clock (time dilation), by the same factor you saw in Experiment 3.",
    next: 'In Experiment 4 we assumed that light always travels at the same speed, c. Next, we ask what would change if light did not work that way.',
  },
  {
    title: "Why can't light go faster?",
    Component: Experiment5,
    learned:
      "We compared two rules for light. In the everyday rule, light gets the speed of the moving clock added to its own, like a ball thrown from a moving train. Then the moving clock would tick at the same rate as the clock standing still, but its light would travel faster than c. In light's actual rule, light always travels at c. The light has a longer path but cannot go faster, so the moving clock's tick takes longer. That is time dilation. In this model, time dilation happens because light always travels at c.",
    next: 'So far, the light in our clocks went across the motion. Next, we turn the clock so that its mirrors are in a line with the motion. Does motion change how long a clock is?',
  },
  {
    title: 'Does motion change length?',
    Component: Experiment6,
    learned:
      "Time dilation says that a moving clock must tick slowly, whichever way it is turned. Light in the lab always goes at c, so a clock moving along its own length can only tick that slowly if it is shorter, as seen from the lab. It is shorter by the same factor as the time dilation factor. This effect is called length contraction. Only the length along the motion changes.",
    next: "So far you compared elapsed time and length between the lab and a moving clock. Next, we ask about something else that felt certain: whether two events happen at the same time.",
  },
  {
    title: 'At the same time... for whom?',
    Component: Experiment7,
    learned:
      "Someone riding along with a moving rod sees a flash from its center reach both ends at the same time. The lab does not: the back end moves toward the flash and the front end moves away, so the lab sees the back end reached first. This is not a delay in either frame's own clocks. It is called relativity of simultaneity: two events that are simultaneous in one reference frame need not be simultaneous in another.",
    next: 'These are all the experiments for now. You can go back to any chapter and run it again.',
  },
]

const STORAGE_KEY = 'spacetime-explorer-progress'

interface Progress {
  currentChapter: number
  completed: number[]
  // Chapters whose tutor conversation was finished; their summary is shown.
  explained: number[]
}

// -1 is the unnumbered Welcome screen, before chapter 0.
function isChapterIndex(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= -1 && (value as number) < chapters.length
}

function loadProgress(): Progress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        currentChapter: isChapterIndex(parsed.currentChapter) ? parsed.currentChapter : -1,
        completed: Array.isArray(parsed.completed) ? parsed.completed.filter(isChapterIndex) : [],
        explained: Array.isArray(parsed.explained) ? parsed.explained.filter(isChapterIndex) : [],
      }
    }
  } catch {
    // Storage unavailable or corrupt: start fresh.
  }
  // No saved progress means a first-ever visit: start on Welcome.
  return { currentChapter: -1, completed: [], explained: [] }
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
  const [explained, setExplained] = useState<number[]>(initialProgress.explained)

  useEffect(() => {
    saveProgress({ currentChapter, completed, explained })
  }, [currentChapter, completed, explained])

  const markComplete = (index: number) => {
    setCompleted((previous) => (previous.includes(index) ? previous : [...previous, index]))
  }

  const markExplained = (index: number) => {
    setExplained((previous) => (previous.includes(index) ? previous : [...previous, index]))
  }

  const isWelcome = currentChapter === -1
  const activeChapter = isWelcome ? null : chapters[currentChapter]
  const isCurrentExplained = !isWelcome && explained.includes(currentChapter)
  const isFirst = currentChapter === -1
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

        <div className="chapter-layout">
          <nav aria-label="Experiments" className="chapter-nav">
            <button
              type="button"
              onClick={() => setCurrentChapter(-1)}
              aria-current={isWelcome ? 'step' : undefined}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem 1rem',
                marginBottom: '0.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
                border: isWelcome ? '2px solid #333' : '1px solid #ccc',
                borderRadius: '6px',
                backgroundColor: isWelcome ? '#fff' : 'transparent',
                fontWeight: isWelcome ? 700 : 500,
              }}
            >
              Welcome
            </button>
            <ol className="chapter-list">
              {chapters.map((chapter, index) => {
                const isCurrent = index === currentChapter
                const isCompleted = completed.includes(index)
                return (
                  <li key={chapter.title}>
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

          <main className="chapter-main">
            {activeChapter ? (
              <activeChapter.Component
                key={currentChapter}
                onComplete={() => markComplete(currentChapter)}
                onTutorComplete={() => markExplained(currentChapter)}
              />
            ) : (
              <Welcome chapters={chapters} onSelectChapter={setCurrentChapter} />
            )}

            {!isWelcome && !isCurrentExplained && (
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
                When you have run the experiment and answered the questions that follow it, a short
                summary of what you learned and what comes next will appear here.
              </p>
            )}

            {isCurrentExplained && (
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
                  <strong>What you learned.</strong> {activeChapter?.learned}
                </p>
                <p style={{ marginTop: 0, marginBottom: 0 }}>
                  <strong>What's next.</strong> {activeChapter?.next}
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
