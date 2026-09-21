import { useState } from 'react'

type TutorStep = 'observe' | 'compare' | 'conceptual' | 'explained'

interface Experiment5TutorProps {
  onExplained?: () => void
  velocity: number
  prediction: {
    choice: 'everyday' | 'actual' | 'same'
    everydayTick: number
    actualTick: number
  }
  restTickDuration: number
  everydayTick: number
  everydayLightSpeed: number
  actualTick: number
  actualTimeDilationFactor: number
}

const PREDICTED_WHICH = {
  everyday: 'the everyday rule would make the tick longer',
  actual: "light's actual rule would make the tick longer",
  same: 'both rules would give the same tick',
}

export function Experiment5Tutor({
  velocity,
  prediction,
  restTickDuration,
  everydayTick,
  everydayLightSpeed,
  actualTick,
  actualTimeDilationFactor,
  onExplained,
}: Experiment5TutorProps) {
  const predictedWhich = PREDICTED_WHICH[prediction.choice]
  const [tutorStep, setTutorStep] = useState<TutorStep>('observe')
  const [responseInput, setResponseInput] = useState('')

  const handleContinue = () => {
    if (responseInput.trim() === '') return

    if (tutorStep === 'observe') {
      setTutorStep('compare')
    } else if (tutorStep === 'compare') {
      setTutorStep('conceptual')
    } else if (tutorStep === 'conceptual') {
      setTutorStep('explained')
      onExplained?.()
    }
    setResponseInput('')
  }

  const isResponseEmpty = responseInput.trim() === ''

  return (
    <div
      style={{
        marginTop: '2rem',
        padding: '1.5rem',
        border: '1px solid #d9e8f5',
        borderRadius: '8px',
        backgroundColor: '#f0f7ff',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem', color: '#0066cc' }}>
        Let's reflect on what you observed
      </h2>

      {(tutorStep === 'observe' || tutorStep === 'compare' || tutorStep === 'conceptual') && (
        <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333' }}>
            {tutorStep === 'observe' &&
              'Look at the two moving clocks. What is different between them? Think about the path the light takes and how long each tick lasted.'}
            {tutorStep === 'compare' &&
              `You predicted that ${predictedWhich}. You guessed ${prediction.everydayTick} s for the everyday rule and ${prediction.actualTick} s for light's actual rule. The real times, on the lab's clocks, were ${everydayTick.toFixed(3)} s and ${actualTick.toFixed(3)} s. What do you notice when you compare your guesses with the real times?`}
            {tutorStep === 'conceptual' &&
              'Under the everyday rule, how fast was the light going when we watched from the lab? Was that faster than c, slower than c, or exactly c?'}
          </p>

          <textarea
            value={responseInput}
            onChange={(e) => setResponseInput(e.target.value)}
            placeholder="Type your thoughts here..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '0.75rem',
              fontSize: '0.875rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />

          <button
            onClick={handleContinue}
            disabled={isResponseEmpty}
            style={{
              marginTop: '0.75rem',
              padding: '0.5rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              backgroundColor: isResponseEmpty ? '#ccc' : '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isResponseEmpty ? 'not-allowed' : 'pointer',
              opacity: isResponseEmpty ? 0.6 : 1,
            }}
          >
            Continue
          </button>
        </div>
      )}

      {tutorStep === 'explained' && (
        <div>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>Let's go through it one step at a time.</p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>1. What stayed the same.</strong> Both moving clocks are the same clock. Someone
            riding along with it sees the light go straight up and straight back down at speed c,
            so on the clock's own display, one tick lasts 1 second. That is why both moving clocks
            showed 1.0 second at the end. The two rules only differ in what the lab sees.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>2. The everyday rule.</strong> From the lab, the light does two things at once:
            it goes up, and the moving clock carries it sideways. It is like the ball thrown from a
            train, which gets the train's speed added to its own. So the light follows a slanted
            path, and it travels faster than c: at {velocity}c, that is{' '}
            {everydayLightSpeed.toFixed(3)}c. The light is going faster, so it covers the longer,
            slanted path in the same time as the clock at rest. One tick takes{' '}
            {everydayTick.toFixed(3)} seconds of lab time. So the moving clock ticks just like the
            clock standing still. With this rule, there is no time dilation.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>3. Light's actual rule.</strong> Now the light does not get the extra speed.
            Seen from the lab, it always goes at c. The path is still slanted and longer, but the
            light stays at c, so it cannot make up the extra distance by going faster. It simply
            takes longer to get there. At {velocity}c, one tick took {actualTick.toFixed(3)} seconds
            on the lab's clocks, instead of {restTickDuration.toFixed(3)}. But the moving clock's
            own display still shows only 1 second per tick. So from the lab, the moving clock ticks
            more slowly than the clock standing still. That is <strong>time dilation</strong>. Its
            factor is {actualTimeDilationFactor.toFixed(3)} ({restTickDuration.toFixed(3)} second divided
            by {actualTick.toFixed(3)} seconds), the same number you saw in Experiments 3 and 4.
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>4. The big idea.</strong> In this model, a moving clock runs slow because light
            always goes at c in the lab. If light could get the extra speed, like the ball on the
            train, the moving clock would tick normally. But then light would travel faster than c.
          </p>
          <p style={{ marginBottom: '0', fontSize: '0.95rem', color: '#333', lineHeight: '1.6' }}>
            <strong>Two things to remember.</strong> First, the everyday rule is only a "what if".
            It is not something that happens. Second, "light always goes at c" is the rule we
            assume in this course, as in Experiment 4. This experiment shows what follows from that
            rule. It does not explain why light behaves this way.
          </p>
        </div>
      )}
    </div>
  )
}
