import { useState } from 'react'
import { PHARMACIES, doseText, prettyDate } from '../data.js'
import { OrderTrack } from './parts.jsx'

const NEXT_ACTION = { new: 'Accept order', accepted: 'Send out for delivery', out: 'Mark delivered' }

export default function PharmacyView({ state, dispatch }) {
  const { patient, prescription, meds, orders } = state
  const [pharmacyId, setPharmacyId] = useState('sharma')
  const mine = orders.filter((o) => o.pharmacyId === pharmacyId)
  const open = mine.filter((o) => o.status !== 'delivered')
  const done = mine.filter((o) => o.status === 'delivered').slice(0, 5)

  return (
    <div className="view">
      <label className="field">
        Pharmacy
        <select value={pharmacyId} onChange={(e) => setPharmacyId(e.target.value)}>
          {PHARMACIES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <h2>Orders to fill ({open.length})</h2>
      {open.length === 0 && <p className="muted">No new orders. Ask the family to request a refill.</p>}
      {open.map((o) => (
        <section key={o.id} className="card order">
          <div className="med-top">
            <div>
              <div className="med-name">{o.kind === 'prescription' ? 'New prescription' : 'Refill request'}</div>
              <div className="muted">
                {o.kind === 'prescription' ? `From ${prescription.doctor}` : `From ${patient.family}`} ·{' '}
                {prettyDate(o.date)}
              </div>
            </div>
            <span className="pill blue">{patient.id}</span>
          </div>
          <div className="muted small">
            For {patient.name}, {patient.age} · Rx {prescription.doctor}, {prettyDate(prescription.date)}
          </div>
          <ul className="plain items">
            {o.items.map((i) => {
              const m = meds.find((x) => x.id === i.medId)
              if (!m) return null
              return (
                <li key={i.medId}>
                  <b>{m.name}</b> ({m.generic} {m.strength}) × {i.qty} tablets
                  <div className="muted small">{doseText(m)}</div>
                </li>
              )
            })}
          </ul>
          <OrderTrack status={o.status} />
          <button className="btn primary wide" onClick={() => dispatch({ type: 'advanceOrder', id: o.id })}>
            {NEXT_ACTION[o.status]}
          </button>
        </section>
      ))}

      {done.length > 0 && (
        <>
          <h2>Delivered</h2>
          <ul className="log">
            {done.map((o) => (
              <li key={o.id}>
                <span className="log-date">{prettyDate(o.date)}</span>
                <span>{o.items.map((i) => meds.find((m) => m.id === i.medId)?.name).join(', ')}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
