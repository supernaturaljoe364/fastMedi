import { ORDER_LABEL, ORDER_STEPS } from '../store.js'

export function DaysBar({ days, tone }) {
  const pct = Math.min(100, (days / 30) * 100)
  return (
    <div className="bar-wrap" aria-label={`${days} days left`}>
      <div className="bar">
        <div className={`bar-fill ${tone}`} style={{ width: `${Math.max(pct, 3)}%` }} />
      </div>
      <span className="bar-label">
        {days} day{days === 1 ? '' : 's'} left
      </span>
    </div>
  )
}

export function OrderTrack({ status }) {
  const at = ORDER_STEPS.indexOf(status)
  return (
    <div className="track">
      <div className="track-steps">
        {ORDER_STEPS.map((s, i) => (
          <span key={s} className={i <= at ? 'step on' : 'step'} />
        ))}
      </div>
      <div className="track-label">{ORDER_LABEL[status]}</div>
    </div>
  )
}
