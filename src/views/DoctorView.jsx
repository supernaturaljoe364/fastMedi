import { useState } from 'react'
import { FREQUENCIES, PHARMACIES, prettyDate } from '../data.js'

const BLANK = { name: '', generic: '', strength: '', dose: 1, frequency: 'morning', duration: 'Ongoing' }

export default function DoctorView({ state, dispatch }) {
  const { patient, prescription, meds } = state
  const [query, setQuery] = useState(patient.id)
  const [found, setFound] = useState(false)
  const [rows, setRows] = useState(() => meds.map(({ stock: _stock, ...m }) => m))
  const [pharmacyId, setPharmacyId] = useState(prescription.pharmacyId)
  const [sent, setSent] = useState(false)

  const update = (i, k, v) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [k]: v } : row)))
  const valid = rows.length > 0 && rows.every((r) => r.name.trim() && r.generic.trim() && r.strength.trim())

  if (!found) {
    return (
      <div className="view">
        <h2>Find patient</h2>
        <form
          className="card"
          onSubmit={(e) => {
            e.preventDefault()
            setFound(query.trim().toUpperCase() === patient.id)
          }}
        >
          <label className="field">
            Patient ID
            <input value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <button className="btn primary wide">Find</button>
        </form>
        <p className="muted">Try {patient.id}.</p>
      </div>
    )
  }

  if (sent) {
    const pharmacy = PHARMACIES.find((p) => p.id === pharmacyId)
    return (
      <div className="view">
        <section className="card done-card">
          <div className="big-tick">✓</div>
          <h2>Prescription sent</h2>
          <p>
            {pharmacy.name} has it, and {patient.family} can see it now.
          </p>
          <button className="btn wide" onClick={() => setSent(false)}>
            Back to patient
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="view">
      <section className="card patient">
        <div className="patient-name">
          {patient.name}, {patient.age}
        </div>
        <div className="muted">
          {patient.id} · Family: {patient.family} · Last prescription {prettyDate(prescription.date)}
        </div>
      </section>

      <h2>Prescription</h2>
      {rows.map((r, i) => (
        <section key={r.id ?? i} className="card rx-row">
          <div className="rx-head">
            <span className="muted small">Medicine {i + 1}</span>
            <button className="link danger" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}>
              Remove
            </button>
          </div>
          <div className="two">
            <label className="field">
              Brand
              <input value={r.name} onChange={(e) => update(i, 'name', e.target.value)} placeholder="Amlong 5" />
            </label>
            <label className="field">
              Salt
              <input value={r.generic} onChange={(e) => update(i, 'generic', e.target.value)} placeholder="Amlodipine" />
            </label>
          </div>
          <div className="two">
            <label className="field">
              Strength
              <input value={r.strength} onChange={(e) => update(i, 'strength', e.target.value)} placeholder="5 mg" />
            </label>
            <label className="field">
              Dose
              <select value={r.dose} onChange={(e) => update(i, 'dose', Number(e.target.value))}>
                <option value={0.5}>½ tablet</option>
                <option value={1}>1 tablet</option>
                <option value={2}>2 tablets</option>
              </select>
            </label>
          </div>
          <div className="two">
            <label className="field">
              How often
              <select value={r.frequency} onChange={(e) => update(i, 'frequency', e.target.value)}>
                {FREQUENCIES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Duration
              <input value={r.duration} onChange={(e) => update(i, 'duration', e.target.value)} />
            </label>
          </div>
        </section>
      ))}
      <button className="btn wide" onClick={() => setRows((rs) => [...rs, { ...BLANK }])}>
        + Add medicine
      </button>

      <h2>Send to pharmacy</h2>
      {PHARMACIES.map((p) => (
        <label key={p.id} className={pharmacyId === p.id ? 'card choice on' : 'card choice'}>
          <input type="radio" name="pharmacy" checked={pharmacyId === p.id} onChange={() => setPharmacyId(p.id)} />
          <div>
            <b>{p.name}</b>
            <div className="muted">
              {p.area} · {p.distance} from patient
            </div>
          </div>
        </label>
      ))}

      <button
        className="btn primary wide"
        disabled={!valid}
        onClick={() => {
          dispatch({ type: 'sendPrescription', meds: rows, pharmacyId })
          setSent(true)
        }}
      >
        Send prescription
      </button>
    </div>
  )
}
