import { useState } from 'react'
import { ROLES, prettyDate, roleById, todayISO } from './data.js'
import { useStore } from './store.js'
import DoctorView from './views/DoctorView.jsx'
import PharmacyView from './views/PharmacyView.jsx'
import FamilyView from './views/FamilyView.jsx'
import DadiView from './views/DadiView.jsx'

const VIEWS = { doctor: DoctorView, pharmacy: PharmacyView, family: FamilyView, dadi: DadiView }

export default function App() {
  const [state, dispatch] = useStore()
  const [roleId, setRoleId] = useState('family')
  const [resets, setResets] = useState(0)
  const role = roleById(roleId)
  const today = todayISO(state.offset)
  const View = VIEWS[roleId]

  return (
    <div className="shell">
      <div className="demo-bar">
        <span className="demo-label">Viewing as</span>
        <div className="roles" role="tablist">
          {ROLES.map((r) => (
            <button
              key={r.id}
              role="tab"
              aria-selected={r.id === roleId}
              className={r.id === roleId ? 'role active' : 'role'}
              onClick={() => setRoleId(r.id)}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      <main className={roleId === 'dadi' ? 'phone big' : 'phone'}>
        <header className="app-head">
          <div>
            <div className="brand">
              fast<span>Medi</span>
            </div>
            <div className="sub">{role.label}</div>
          </div>
          <div className="today">Today · {prettyDate(today)}</div>
        </header>
        <View key={`${roleId}-${resets}`} state={state} dispatch={dispatch} today={today} />
      </main>

      <footer className="demo-foot">
        <span>Demo controls</span>
        <button onClick={() => dispatch({ type: 'advanceDay' })}>+1 day</button>
        <button
          onClick={() => {
            dispatch({ type: 'reset' })
            setResets((n) => n + 1)
          }}
        >
          Reset data
        </button>
      </footer>
    </div>
  )
}
