import { useState } from 'react'
import relativityBanner from '../assets/relativity-banner.jpg'

interface PreviewChapter {
  title: string
}

// Collapsed by default so this section stays a fixed, small size no matter how many
// experiments the app eventually has.
const PREVIEW_COUNT = 4

interface WelcomeProps {
  chapters: PreviewChapter[]
  onSelectChapter: (index: number) => void
}

const iconStyle = { display: 'block' }

// Small symbolic icons, one per experiment, matched by array index. Purely illustrative — not
// drawn from the physics model, unlike the animations inside each experiment.
const icons: JSX.Element[] = [
  // 1. One clock
  <svg viewBox="0 0 40 40" style={iconStyle} aria-hidden="true">
    <circle cx="20" cy="20" r="15" fill="none" stroke="#555" strokeWidth="2" />
    <line x1="20" y1="20" x2="20" y2="10" stroke="#555" strokeWidth="2" strokeLinecap="round" />
    <line x1="20" y1="20" x2="27" y2="24" stroke="#555" strokeWidth="2" strokeLinecap="round" />
  </svg>,
  // 2. Two clocks at rest
  <svg viewBox="0 0 40 40" style={iconStyle} aria-hidden="true">
    <circle cx="13" cy="20" r="10" fill="none" stroke="#555" strokeWidth="2" />
    <line x1="13" y1="20" x2="13" y2="13" stroke="#555" strokeWidth="2" strokeLinecap="round" />
    <line x1="13" y1="20" x2="18" y2="22" stroke="#555" strokeWidth="2" strokeLinecap="round" />
    <circle cx="27" cy="20" r="10" fill="none" stroke="#555" strokeWidth="2" />
    <line x1="27" y1="20" x2="27" y2="13" stroke="#555" strokeWidth="2" strokeLinecap="round" />
    <line x1="27" y1="20" x2="32" y2="22" stroke="#555" strokeWidth="2" strokeLinecap="round" />
  </svg>,
  // 3. A moving clock
  <svg viewBox="0 0 40 40" style={iconStyle} aria-hidden="true">
    <circle cx="15" cy="20" r="12" fill="none" stroke="#555" strokeWidth="2" />
    <line x1="15" y1="20" x2="15" y2="12" stroke="#555" strokeWidth="2" strokeLinecap="round" />
    <line x1="15" y1="20" x2="21" y2="23" stroke="#555" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M29 20 H36 M32 16 L36 20 L32 24"
      fill="none"
      stroke="#555"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>,
  // 4. Why time dilation happens (light bouncing between two mirrors)
  <svg viewBox="0 0 40 40" style={iconStyle} aria-hidden="true">
    <line x1="8" y1="9" x2="32" y2="9" stroke="#555" strokeWidth="3" strokeLinecap="round" />
    <line x1="8" y1="31" x2="32" y2="31" stroke="#555" strokeWidth="3" strokeLinecap="round" />
    <polyline
      points="10,9 17,31 24,9 30,31"
      fill="none"
      stroke="#e6a700"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>,
  // 5. Why can't light go faster (a beam approaching a hard limit)
  <svg viewBox="0 0 40 40" style={iconStyle} aria-hidden="true">
    <line x1="6" y1="20" x2="26" y2="20" stroke="#e6a700" strokeWidth="2" strokeLinecap="round" />
    <path d="M20 15 L26 20 L20 25" fill="none" stroke="#e6a700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="31" y1="8" x2="31" y2="32" stroke="#555" strokeWidth="3" strokeLinecap="round" />
  </svg>,
  // 6. Does motion change length (rest length vs. shorter length)
  <svg viewBox="0 0 40 40" style={iconStyle} aria-hidden="true">
    <line x1="5" y1="14" x2="35" y2="14" stroke="#555" strokeWidth="4" strokeLinecap="round" />
    <line x1="10" y1="27" x2="30" y2="27" stroke="#555" strokeWidth="4" strokeLinecap="round" />
  </svg>,
  // 7. At the same time... for whom (a flash from the center reaching both ends)
  <svg viewBox="0 0 40 40" style={iconStyle} aria-hidden="true">
    <line x1="6" y1="20" x2="34" y2="20" stroke="#555" strokeWidth="3" strokeLinecap="round" />
    <circle cx="20" cy="20" r="2.5" fill="#e6a700" />
    <circle cx="6" cy="20" r="2.5" fill="#2e7d32" />
    <circle cx="34" cy="20" r="2.5" fill="#2e7d32" />
  </svg>,
]

export function Welcome({ chapters, onSelectChapter }: WelcomeProps) {
  const [expanded, setExpanded] = useState(false)
  const hasMore = chapters.length > PREVIEW_COUNT
  const visibleChapters = expanded ? chapters : chapters.slice(0, PREVIEW_COUNT)

  return (
    <div style={{ padding: '2rem', maxWidth: '720px', margin: '0 auto' }}>
      <h2>Welcome</h2>

      <img
        src={relativityBanner}
        alt="An astronaut and spacecraft near Earth, Earth resting in a warped grid representing spacetime, and two black holes merging with rippling gravitational waves"
        className="welcome-banner"
        style={{ width: '100%', height: 'auto', marginTop: '1.5rem', display: 'block' }}
      />

      <div
        className="welcome-card"
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
        }}
      >
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The goal.</strong> This app is an interactive laboratory for building an
            intuitive understanding of relativity — why moving clocks tick differently, why moving
            things measure shorter, why "at the same time" isn't the same for everyone — by running
            experiments yourself rather than reading about them.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Why it's worth exploring.</strong> You may have heard that astronauts' clocks run
            at a very slightly different rate than clocks on Earth, or that GPS satellites need
            constant correction to stay accurate. Claims like these can sound like science fiction.
            This app doesn't just tell you they're true — it lets you run the actual experiments that
            show why, starting from a single clock and building up, one small step at a time, to why
            motion changes time, length, and even the order of events.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>How this works.</strong> Each experiment follows the same pattern: you make a
            prediction, run the experiment, and observe what happens.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The AI tutor.</strong> After you observe the result, an AI tutor asks what you
            noticed and what you think it means, before explaining anything. It won't lecture at you
            up front — it wants you to reason it out first, the same way you just did with your
            prediction. Only once you've answered does it walk through why the result came out the
            way it did.
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>How it's organized.</strong> The experiments build on each other in order, listed
            in the sidebar to the left. You're free to revisit any of them at any time — nothing is
            locked — but each one assumes you already understand the ones before it.
          </p>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          <strong>What you'll explore.</strong>
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '0.625rem',
          }}
        >
          {visibleChapters.map((chapter, index) => (
            <button
              key={chapter.title}
              type="button"
              onClick={() => onSelectChapter(index)}
              className="preview-button"
              style={{
                padding: '0.5rem 0.625rem',
                fontSize: '0.8125rem',
                color: 'var(--text)',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <span className={`icon-badge badge-${index % 4}`}>{icons[index]}</span>
              <span>
                {index + 1}. {chapter.title}
              </span>
            </button>
          ))}
          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded((previous) => !previous)}
              className="more-button"
              style={{
                padding: '0.5rem 0.625rem',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {expanded ? 'Show fewer' : `+ ${chapters.length - PREVIEW_COUNT} more`}
            </button>
          )}
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: '2rem' }}>
        <span className="cta-pill" style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}>
          Press "Next" below, or a topic above, when you're ready to begin.
        </span>
      </p>
    </div>
  )
}
