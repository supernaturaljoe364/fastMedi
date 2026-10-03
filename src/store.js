import { useEffect, useReducer } from 'react'
import { LOW_DAYS, daysLeft, newId, pharmacyById, refillQty, seed, tabletsLeft, todayISO } from './data.js'

const KEY = 'fastmedi-v2'

export const ORDER_STEPS = ['new', 'accepted', 'out', 'delivered']
export const ORDER_LABEL = {
  new: 'Sent to pharmacy',
  accepted: 'Pharmacy is packing it',
  out: 'Out for delivery',
  delivered: 'Delivered',
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // Storage blocked or corrupt — fall back to fresh demo data.
  }
  return seed()
}

const sameMed = (a, b) =>
  a.generic.trim().toLowerCase() === b.generic.trim().toLowerCase() &&
  a.strength.replace(/\s/g, '').toLowerCase() === b.strength.replace(/\s/g, '').toLowerCase()

function addLog(state, who, text) {
  return [{ id: newId(), date: todayISO(state.offset), who, text }, ...state.log]
}

function newOrder(state, kind, meds, pharmacyId) {
  return {
    id: newId(),
    kind,
    items: meds.map((m) => ({ medId: m.id, qty: refillQty(m) })),
    status: 'new',
    date: todayISO(state.offset),
    pharmacyId,
  }
}

function reducer(state, action) {
  const today = todayISO(state.offset)
  switch (action.type) {
    case 'reset':
      return seed()

    case 'advanceDay':
      return { ...state, offset: state.offset + 1 }

    case 'sendPrescription': {
      // Keep the stock of medicines that carry over; new ones start at zero.
      const meds = action.meds.map((m) => {
        const prev = state.meds.find((p) => sameMed(p, m))
        const stock = prev ? { count: tabletsLeft(prev, today), date: today } : { count: 0, date: today }
        return { ...m, id: prev?.id ?? newId(), stock }
      })
      const needed = meds.filter((m) => daysLeft(m, today) <= LOW_DAYS)
      const pharmacy = pharmacyById(action.pharmacyId)
      return {
        ...state,
        meds,
        prescription: { ...state.prescription, id: newId(), date: today, pharmacyId: action.pharmacyId },
        orders: needed.length
          ? [newOrder(state, 'prescription', needed, action.pharmacyId), ...state.orders]
          : state.orders,
        flags: state.flags.filter((id) => meds.some((m) => m.id === id)),
        log: addLog(state, state.prescription.doctor, `Sent a new prescription to ${pharmacy.name}`),
      }
    }

    case 'requestRefill': {
      const meds = state.meds.filter((m) => action.medIds.includes(m.id))
      return {
        ...state,
        orders: [newOrder(state, 'refill', meds, state.prescription.pharmacyId), ...state.orders],
        log: addLog(state, state.patient.family, `Asked for a refill: ${meds.map((m) => m.name).join(', ')}`),
      }
    }

    case 'advanceOrder': {
      const order = state.orders.find((o) => o.id === action.id)
      const next = ORDER_STEPS[ORDER_STEPS.indexOf(order.status) + 1]
      const pharmacy = pharmacyById(order.pharmacyId).name
      let { meds, flags } = state
      if (next === 'delivered') {
        const qty = new Map(order.items.map((i) => [i.medId, i.qty]))
        meds = meds.map((m) =>
          qty.has(m.id) ? { ...m, stock: { count: tabletsLeft(m, today) + qty.get(m.id), date: today } } : m,
        )
        flags = flags.filter((id) => !qty.has(id))
      }
      const names = order.items.map((i) => state.meds.find((m) => m.id === i.medId)?.name).join(', ')
      return {
        ...state,
        meds,
        flags,
        orders: state.orders.map((o) => (o.id === order.id ? { ...o, status: next } : o)),
        log: addLog(state, pharmacy, `${ORDER_LABEL[next]}: ${names}`),
      }
    }

    case 'flagLow': {
      if (state.flags.includes(action.medId)) return state
      const med = state.meds.find((m) => m.id === action.medId)
      return {
        ...state,
        flags: [...state.flags, action.medId],
        log: addLog(state, state.patient.short, `Said ${med.name} is running low`),
      }
    }

    default:
      return state
  }
}

export function useStore() {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      // Private mode etc. — the demo still works for this session.
    }
  }, [state])
  return [state, dispatch]
}

// Medicines already on an order that hasn't been delivered yet.
export function onOrder(state) {
  return new Set(state.orders.filter((o) => o.status !== 'delivered').flatMap((o) => o.items.map((i) => i.medId)))
}
