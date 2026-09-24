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
import { Experiment8 } from './components/Experiment8'
import { Experiment9 } from './components/Experiment9'
import { Experiment10 } from './components/Experiment10'
import { Experiment11 } from './components/Experiment11'

interface Chapter {
  title: string
  // The named group of experiments this chapter belongs to; shown once as the page heading.
  group: string
  Component: ComponentType<{ onComplete?: () => void; onTutorComplete?: () => void }>
  // Shown below the experiment once the learner has run it and finished the tutor's questions.
  learned: string
  next: string
}

const chapters: Chapter[] = [
  {
    title: 'One clock',
    group: 'Relativity of Time and Motion',
    Component: Experiment1,
    learned:
      "A clock measures how much time passes between two events. Here, the two events were the start and the end of the experiment. The elapsed time is the difference between the clock's two readings.",
    next: 'You used one clock. Next, two clocks in two different places will measure the same two events. Will they agree?',
  },
  {
    title: 'Two clocks at rest',
    group: 'Relativity of Time and Motion',
    Component: Experiment2,
    learned:
      'Two clocks standing still in the same reference frame, set to the same reading at the start, measured the same elapsed time between the same two events.',
    next: 'So far, nothing has moved. Next, one clock moves compared with the lab. Will it still agree with the clocks that stand still?',
  },
  {
    title: 'A moving clock',
    group: 'Relativity of Time and Motion',
    Component: Experiment3,
    learned:
      'When a clock moves compared with the lab, it measures less elapsed time than the lab clock between the same two events. This effect is called time dilation. The faster the clock moves, the bigger the difference. The moving clock is not broken: the time that passes between two events depends on who is measuring (their reference frame) and how they are moving. (At speed 0 nothing moves, and the two clocks agree.)',
    next: 'Why does time dilation happen? Next, we look inside a clock to find the reason.',
  },
  {
    title: 'Why time dilation happens',
    group: 'Relativity of Time and Motion',
    Component: Experiment4,
    learned:
      "In the lab, light travels at the same speed for both light clocks. The moving clock's pulse of light has a longer, slanted path to travel, so each of its ticks takes longer on the lab's clocks. That is why the moving clock measures less time than the lab clock (time dilation), by the same factor you saw in Experiment 3.",
    next: 'In Experiment 4 we assumed that light always travels at the same speed, c. Next, we ask what would change if light did not work that way.',
  },
  {
    title: "Why can't light go faster?",
    group: 'Relativity of Time and Motion',
    Component: Experiment5,
    learned:
      "We compared two rules for light. In the everyday rule, light gets the speed of the moving clock added to its own, like a ball thrown from a moving train. Then the moving clock would tick at the same rate as the clock standing still, but its light would travel faster than c. In light's actual rule, light always travels at c. The light has a longer path but cannot go faster, so the moving clock's tick takes longer. That is time dilation. In this model, time dilation happens because light always travels at c.",
    next: 'So far, the light in our clocks went across the motion. Next, we turn the clock so that its mirrors are in a line with the motion. Does motion change how long a clock is?',
  },
  {
    title: 'Does motion change length?',
    group: 'Relativity of Time and Motion',
    Component: Experiment6,
    learned:
      "Time dilation says that a moving clock must tick slowly, whichever way it is turned. Light in the lab always goes at c, so a clock moving along its own length can only tick that slowly if it is shorter, as seen from the lab. It is shorter by the same factor as the time dilation factor. This effect is called length contraction. Only the length along the motion changes.",
    next: "So far you compared elapsed time and length between the lab and a moving clock. Next, we ask about something else that felt certain: whether two events happen at the same time.",
  },
  {
    title: 'At the same time... for whom?',
    group: 'Relativity of Time and Motion',
    Component: Experiment7,
    learned:
      "Someone riding along with a moving rod sees a flash from its center reach both ends at the same time. The lab does not: the back end moves toward the flash and the front end moves away, so the lab sees the back end reached first. This is not a delay in either frame's own clocks. It is called relativity of simultaneity: two events that are simultaneous in one reference frame need not be simultaneous in another.",
    next: 'Next, we look at the same rod and flash a different way: as a single picture, with position and time drawn together.',
  },
  {
    title: 'Drawing Spacetime',
    group: 'Relativity of Time and Motion',
    Component: Experiment8,
    learned:
      "A spacetime diagram plots position and time together: a still object is a vertical line, a moving object is a slanted line (a worldline), and light is always drawn at the same slope. The same two events from Experiment 7 — the flash reaching the back end, then the front end — are just where the rod's worldlines cross the light's. The picture agrees with the numbers.",
    next: "Next, we draw one more line on the same picture: one that shows what 'the same moment' looks like for someone riding along with the rod.",
  },
  {
    title: 'Same Time, Different Line',
    group: 'Relativity of Time and Motion',
    Component: Experiment9,
    learned:
      "A flat line straight across the diagram shows what the lab calls \"the same moment.\" But the two events that Experiment 7 said were simultaneous for the rod are not on a flat line at all — they're on a tilted one. \"The same moment\" really does depend on who is watching: it isn't a trick of measurement, it's a different, real line on the same page.",
    next: 'Next, we apply time dilation to a whole round trip: two twins, one who travels and one who stays home, and a famous puzzle about which one is older when they reunite.',
  },
  {
    title: 'The Twin Paradox',
    group: 'Relativity of Time and Motion',
    Component: Experiment10,
    learned:
      "It looked like a contradiction at first: motion is relative, so each twin could argue the other one's clock should run slow. But the two twins aren't in the same situation — only the traveling twin turns around. That difference breaks the symmetry, and it's why, when they're back together comparing the same two clocks, they both agree the traveling twin aged less. It's not a matter of opinion. It's the same time dilation from Experiment 3, just added up over the whole trip.",
    next: "Next, we complete the picture from Experiments 8 and 9: drawing the rod's own two axes on the diagram, and using the actual math that converts the lab's numbers into the rod's own.",
  },
  {
    title: "The Rod's Own Axes",
    group: 'Relativity of Time and Motion',
    Component: Experiment11,
    learned:
      "The rod has its own two tilted axes on the same diagram as the lab's — its own \"straight up\" and \"straight across,\" just like the lab's vertical and horizontal lines, only tilted because it's moving. The Lorentz transformation is the actual mathematical rule for converting an event's lab-frame numbers into the numbers the rod's own frame would assign to it. Applying it to the two flash-arrival events gives the same time for both, in the rod's frame — confirming, by direct calculation, exactly what Experiments 7 and 9 already showed by other means. Nothing physically changed: it's the same rod, the same flash, the same two events, just described using the rod's own ruler-and-clock convention instead of the lab's.",
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
  const [isChapterListOpen, setIsChapterListOpen] = useState(!isWelcome)

  useEffect(() => {
    if (!isWelcome) setIsChapterListOpen(true)
  }, [currentChapter, isWelcome])

  const activeChapter = isWelcome ? null : chapters[currentChapter]
  const isCurrentExplained = !isWelcome && explained.includes(currentChapter)
  const isFirst = currentChapter === -1
  const isLast = currentChapter === chapters.length - 1

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {isWelcome && (
          <>
            <h1 className="app-title" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '3rem' }}>
              SpaceTime Explorer
            </h1>
            <p className="app-subtitle" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 2rem' }}>
              A short sequence of experiments on relativity — space, time, and motion. Each one builds on the one before it.
            </p>
          </>
        )}

        <div className="chapter-layout">
          <nav aria-label="Experiments" className="chapter-nav">
            <button
              type="button"
              onClick={() => setCurrentChapter(-1)}
              aria-current={isWelcome ? 'step' : undefined}
              className={`nav-button${isWelcome ? ' is-active' : ''}`}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem 1rem',
                marginBottom: '0.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: isWelcome ? 700 : 500,
              }}
            >
              Welcome
            </button>
            <button
              type="button"
              className="chapter-group-heading"
              aria-expanded={isChapterListOpen}
              onClick={() => setIsChapterListOpen((open) => !open)}
            >
              {chapters[0].group}
              <span className={`chapter-group-chevron${isChapterListOpen ? ' is-open' : ''}`} aria-hidden="true">
                ▾
              </span>
            </button>
            {isChapterListOpen && (
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
                        className={`nav-button${isCurrent ? ' is-active' : ''}`}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          fontWeight: isCurrent ? 700 : 500,
                        }}
                      >
                        {index + 1}. {chapter.title}
                        {isCompleted && (
                          <span aria-label="completed" className="check" style={{ float: 'right' }}>
                            ✓
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ol>
            )}
          </nav>

          <main className="chapter-main">
            {activeChapter ? (
              <>
                <h2 className="experiment-group-title">{activeChapter.group}</h2>
                <activeChapter.Component
                  key={currentChapter}
                  onComplete={() => markComplete(currentChapter)}
                  onTutorComplete={() => markExplained(currentChapter)}
                />
              </>
            ) : (
              <Welcome chapters={chapters} onSelectChapter={setCurrentChapter} />
            )}

            {!isWelcome && !isCurrentExplained && (
              <p
                className="summary-card"
                style={{
                  maxWidth: '700px',
                  margin: '1rem auto 0',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                }}
              >
                When you have run the experiment and answered the questions that follow it, a short
                summary of what you learned and what comes next will appear here.
              </p>
            )}

            {isCurrentExplained && (
              <section
                aria-label="Chapter summary"
                className="summary-card is-explained"
                style={{
                  maxWidth: '700px',
                  margin: '1rem auto 0',
                  padding: '1rem 1.5rem',
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
                className="primary-button"
                style={{ padding: '0.6rem 1.4rem', fontSize: '1rem' }}
              >
                ← Previous
              </button>
              <button
                type="button"
                disabled={isLast}
                onClick={() => setCurrentChapter(currentChapter + 1)}
                className="primary-button"
                style={{ padding: '0.6rem 1.4rem', fontSize: '1rem' }}
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
