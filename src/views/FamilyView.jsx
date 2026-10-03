import { LOW_DAYS, daysLeft, doseText, pharmacyById, prettyDate, status } from '../data.js'
import { onOrder } from '../store.js'
import { DaysBar, OrderTrack } from './parts.jsx'

export default function FamilyView({ state, dispatch, today }) {
  const { patient, prescription, meds, orders, flags, log } = state
  const pharmacy = pharmacyById(prescription.pharmacyId)
  const coming = onOrder(state)
  const sorted = [...meds].sort((a, b) => daysLeft(a, today) - daysLeft(b, today))
  const low = sorted.filter((m) => !coming.has(m.id) && (daysLeft(m, today) <= LOW_DAYS || flags.includes(m.id)))
  const active = orders.filter((o) => o.status !== 'delivered')
  const refill = (medIds) => dispatch({ type: 'requestRefill', medIds })

  return (
    <div className="view">
      <section className="card patient">
        <div className="patient-name">
          {patient.name}, {patient.age}
        </div>
        <div className="muted">Patient ID {patient.id} · shared with you</div>
      </section>

      {low.length > 0 && (
        <section className="card alert">
          <div className="alert-title">Running low</div>
          <ul className="plain">
            {low.map((m) => (
              <li key={m.id}>
                <b>{m.name}</b>: {daysLeft(m, today)} days left
                {flags.includes(m.id) && <span className="muted"> · Dadi told us too</span>}
              </li>
            ))}
          </ul>
          <button className="btn primary wide" onClick={() => refill(low.map((m) => m.id))}>
            Ask {pharmacy.name} to deliver {low.length > 1 ? 'all' : 'it'}
          </button>
        </section>
      )}

      {active.map((o) => (
        <section key={o.id} className="card">
          <div className="muted small">
            {o.kind === 'prescription' ? 'New prescription' : 'Refill'} · {pharmacyById(o.pharmacyId).name}
          </div>
          <div className="order-items">
            {o.items.map((i) => meds.find((m) => m.id === i.medId)?.name).join(', ')}
          </div>
          <OrderTrack status={o.status} />
        </section>
      ))}

      <h2>Medicines</h2>
      {sorted.map((m) => {
        const d = daysLeft(m, today)
        const st = status(d)
        return (
          <section key={m.id} className="card med">
            <div className="med-top">
              <div>
                <div className="med-name">{m.name}</div>
                <div className="muted">
                  {m.generic} {m.strength}
                </div>
              </div>
              {coming.has(m.id) ? (
                <span className="pill blue">On the way</span>
              ) : (
                <span className={`pill ${st.tone}`}>{st.text}</span>
              )}
            </div>
            <div className="dose">
              {doseText(m)} · {m.duration}
            </div>
            <DaysBar days={d} tone={st.tone} />
            {!coming.has(m.id) && d > LOW_DAYS && (
              <button className="link" onClick={() => refill([m.id])}>
                Refill early
              </button>
            )}
          </section>
        )
      })}

      <section className="card info">
        <div>
          <b>Prescribed by</b> {prescription.doctor}, {prescription.clinic} · {prettyDate(prescription.date)}
        </div>
        <div>
          <b>Pharmacy</b> {pharmacy.name}, {pharmacy.area} · <a href={`tel:${pharmacy.phone}`}>Call</a>
        </div>
      </section>

      <h2>Activity</h2>
      <ul className="log">
        {log.slice(0, 8).map((e) => (
          <li key={e.id}>
            <span className="log-date">{prettyDate(e.date)}</span>
            <span>
              <b>{e.who}</b> · {e.text}
            </span>
          </li>
        ))}
      </ul>

      <p className="disclaimer">
        fastMedi shows the prescription exactly as the doctor wrote it. It doesn't give medical advice.
      </p>
    </div>
  )
}
