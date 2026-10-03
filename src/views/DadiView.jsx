import { daysLeft, doseText, pharmacyById, status } from '../data.js'
import { onOrder } from '../store.js'

// Large text, one job per medicine. No numbers to do sums with.
export default function DadiView({ state, dispatch, today }) {
  const { meds, flags, orders, prescription } = state
  const coming = onOrder(state)
  const out = orders.find((o) => o.status === 'out')
  const pharmacy = pharmacyById(prescription.pharmacyId)

  return (
    <div className="view">
      {out && (
        <section className="card note big-note">
          Your medicines are on the way from {pharmacyById(out.pharmacyId).name}.
        </section>
      )}
      <h2>My medicines</h2>
      {meds.map((m) => {
        const st = status(daysLeft(m, today))
        return (
          <section key={m.id} className={`card dadi-med edge-${st.tone}`}>
            <div className="dadi-name">{m.name}</div>
            <div className="dadi-when">{doseText(m)}</div>
            {coming.has(m.id) ? (
              <div className="dadi-ok">Being delivered ✓</div>
            ) : flags.includes(m.id) ? (
              <div className="dadi-ok">Ravi has been told ✓</div>
            ) : (
              <button className="btn big-btn" onClick={() => dispatch({ type: 'flagLow', medId: m.id })}>
                I'm running low
              </button>
            )}
          </section>
        )
      })}
      <a className="btn primary wide big-btn" href={`tel:${pharmacy.phone}`}>
        Call {pharmacy.name}
      </a>
    </div>
  )
}
