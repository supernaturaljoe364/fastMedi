// Mock data and pure helpers. Every role reads the same local data — no backend.

export const ROLES = [
  { id: 'doctor', name: 'Doctor', label: 'Dr. A. Mehta · City Care Clinic' },
  { id: 'pharmacy', name: 'Pharmacy', label: 'Sharma Medicals · Gandhi Chowk' },
  { id: 'family', name: 'Family', label: 'Ravi · son, lives in Pune' },
  { id: 'dadi', name: 'Dadi', label: 'Kamala Devi, 74' },
]

export const roleById = (id) => ROLES.find((r) => r.id === id)

export const PHARMACIES = [
  { id: 'sharma', name: 'Sharma Medicals', area: 'Gandhi Chowk', distance: '0.4 km', phone: '+919800000000' },
  { id: 'apollo', name: 'Apollo Pharmacy', area: 'Station Road', distance: '1.2 km', phone: '+919800000001' },
]

export const pharmacyById = (id) => PHARMACIES.find((p) => p.id === id)

export const FREQUENCIES = [
  { id: 'morning', label: 'Once a day · morning', times: 1 },
  { id: 'night', label: 'Once a day · night', times: 1 },
  { id: 'twice', label: 'Twice a day', times: 2 },
  { id: 'thrice', label: 'Three times a day', times: 3 },
]

export const freqById = (id) => FREQUENCIES.find((f) => f.id === id)

const DAY = 24 * 60 * 60 * 1000

export function isoDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO(offsetDays = 0) {
  return isoDate(new Date(Date.now() + offsetDays * DAY))
}

export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  return isoDate(new Date(y, m - 1, d + n))
}

export function daysBetween(fromIso, toIso) {
  const [y1, m1, d1] = fromIso.split('-').map(Number)
  const [y2, m2, d2] = toIso.split('-').map(Number)
  return Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / DAY)
}

export function prettyDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export const perDay = (med) => med.dose * freqById(med.frequency).times

// One refill = 30 days of tablets.
export const refillQty = (med) => Math.ceil(perDay(med) * 30)

// Tablets left today, estimated from the last delivery — nobody logs individual doses.
export function tabletsLeft(med, today) {
  const used = perDay(med) * daysBetween(med.stock.date, today)
  return Math.max(0, med.stock.count - used)
}

export function daysLeft(med, today) {
  return Math.floor(tabletsLeft(med, today) / perDay(med))
}

export const LOW_DAYS = 5

export function status(days) {
  if (days <= 2) return { tone: 'red', text: days === 0 ? 'Finished' : 'Almost out' }
  if (days <= LOW_DAYS) return { tone: 'amber', text: 'Running low' }
  return { tone: 'green', text: 'Enough' }
}

export const doseText = (med) =>
  `${med.dose === 0.5 ? '½' : med.dose} tablet${med.dose > 1 ? 's' : ''} · ${freqById(med.frequency).label.toLowerCase()}`

export function newId() {
  return Math.random().toString(36).slice(2, 9)
}

// Seed data is relative to "today" so the demo always has something running low.
export function seed() {
  const today = todayISO()
  const ago = (n) => addDays(today, -n)
  const rxDate = ago(26)
  return {
    offset: 0,
    patient: { id: 'FM-2041', name: 'Kamala Devi', short: 'Dadi', age: 74, family: 'Ravi (son)' },
    prescription: { id: 'rx1', doctor: 'Dr. A. Mehta', clinic: 'City Care Clinic', date: rxDate, pharmacyId: 'sharma' },
    meds: [
      { id: 'm1', name: 'Amlong 5', generic: 'Amlodipine', strength: '5 mg', dose: 1, frequency: 'morning',
        duration: 'Ongoing', stock: { count: 30, date: rxDate } },
      { id: 'm2', name: 'Glycomet 500', generic: 'Metformin', strength: '500 mg', dose: 1, frequency: 'twice',
        duration: 'Ongoing', stock: { count: 60, date: ago(24) } },
      { id: 'm3', name: 'Atorva 10', generic: 'Atorvastatin', strength: '10 mg', dose: 1, frequency: 'night',
        duration: 'Ongoing', stock: { count: 30, date: ago(10) } },
      { id: 'm4', name: 'Pan 40', generic: 'Pantoprazole', strength: '40 mg', dose: 1, frequency: 'morning',
        duration: '3 months', stock: { count: 15, date: ago(13) } },
    ],
    orders: [], // { id, kind: 'prescription' | 'refill', items: [{ medId, qty }], status, date, pharmacyId }
    flags: [], // medIds Dadi tapped "running low" on
    log: [
      { id: newId(), date: ago(10), who: 'Sharma Medicals', text: 'Delivered Atorva 10 (30 tablets)' },
      { id: newId(), date: ago(13), who: 'Sharma Medicals', text: 'Delivered Pan 40 (15 tablets)' },
      { id: newId(), date: rxDate, who: 'Dr. A. Mehta', text: 'Sent a prescription to Sharma Medicals' },
    ],
  }
}
