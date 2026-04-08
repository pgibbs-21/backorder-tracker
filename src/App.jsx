import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase, supabaseEnabled } from './lib/supabase'
import AuthOverlay from './components/AuthOverlay'
import Header from './components/Header'
import Board from './components/Board'
import OrderModal from './components/OrderModal'

export const COLUMNS = [
  { id: 'intake',    title: 'Need + Buyer Check',    step: 'Steps 1–2', icon: 'search',         desc: 'Customer need logged and buyers checked' },
  { id: 'confirm',   title: 'Relay & Confirm',       step: 'Step 3',    icon: 'check-circle',   desc: 'Confirm customer still wants it' },
  { id: 'backorder', title: 'Backordered / Waiting', step: 'Steps 4–5', icon: 'package-search', desc: 'Placed on backorder and waiting on ETA' },
  { id: 'shipped',   title: 'Shipped!',              step: 'Step 6',    icon: 'truck',           desc: 'Order out the door 🎉' },
]

function uid() { return 'id_' + Math.random().toString(36).slice(2, 9) }

const DEMO_ORDERS = [
  { id: uid(), col: 'intake',    customer: 'Alex Carter',  item: 'Shimano Dura-Ace R9200 Crankset',  priority: 'high',   eta: '',         notes: 'Customer need captured. Check with buyer ASAP.' },
  { id: uid(), col: 'intake',    customer: 'Sam Nguyen',   item: 'Fox 34 Step-Cast Fork 120mm',      priority: 'medium', eta: '~3 weeks', notes: 'Customer need logged. Reached out to Fox rep.' },
  { id: uid(), col: 'confirm',   customer: 'Morgan Lee',   item: 'SRAM Force AXS Rear Derailleur',   priority: 'medium', eta: '2 weeks',  notes: 'Emailed customer 4/7.' },
  { id: uid(), col: 'backorder', customer: 'Jordan Wills', item: 'Zipp 303 S Disc Wheelset',         priority: 'high',   eta: 'April 18', notes: 'BO# 449832 — placed on backorder, waiting for ship confirmation.' },
  { id: uid(), col: 'backorder', customer: 'Riley Tran',   item: 'Wahoo KICKR v6 Trainer',           priority: 'low',    eta: 'TBD',      notes: 'Out of stock industry-wide. Waiting on ETA update.' },
  { id: uid(), col: 'shipped',   customer: 'Casey Park',   item: 'Garmin Edge 1040 Solar',           priority: 'medium', eta: '',         notes: 'Shipped 4/6. Tracking sent.' },
]

export default function App() {
  const [orders, setOrders] = useState(DEMO_ORDERS)
  const [currentUser, setCurrentUser] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('local')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [editingDefaultCol, setEditingDefaultCol] = useState('intake')
  const [theme, setTheme] = useState(() =>
    matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )
  const realtimeRef = useRef(null)
  const dragIdRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const loadOrders = useCallback(async () => {
    if (!supabaseEnabled || !currentUser) return
    const { data, error } = await supabase
      .from('backorder_orders')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: true })
    if (!error && data) {
      setOrders(data.map(row => ({
        id: row.id, col: row.col, customer: row.customer, item: row.item,
        priority: row.priority, eta: row.eta || '', notes: row.notes || '',
      })))
    }
  }, [currentUser])

  const subscribeRealtime = useCallback(() => {
    if (!supabaseEnabled || !currentUser) return
    if (realtimeRef.current) supabase.removeChannel(realtimeRef.current)
    realtimeRef.current = supabase
      .channel('board-orders')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'backorder_orders',
        filter: `user_id=eq.${currentUser.id}`,
      }, () => loadOrders())
      .subscribe()
  }, [currentUser, loadOrders])

  useEffect(() => {
    if (!supabaseEnabled) { setConnectionStatus('local'); return }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user || null
      setCurrentUser(user)
      if (user) { setConnectionStatus('live'); subscribeRealtime(); loadOrders() }
      else setConnectionStatus('auth')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null
      setCurrentUser(user)
      if (user) { setOrders([]); setConnectionStatus('live'); subscribeRealtime(); loadOrders() }
      else setConnectionStatus('auth')
    })

    return () => {
      subscription.unsubscribe()
      if (realtimeRef.current) supabase.removeChannel(realtimeRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const createOrder = async (data) => {
    if (!supabaseEnabled || !currentUser) {
      setOrders(prev => [...prev, { id: uid(), col: editingDefaultCol, ...data }])
      return
    }
    await supabase.from('backorder_orders').insert({
      col: editingDefaultCol,
      customer: data.customer,
      item: data.item,
      priority: data.priority,
      eta: data.eta || null,
      notes: data.notes || null,
      user_id: currentUser.id,
    })
  }

  const updateOrder = async (id, patch) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o))
    if (!supabaseEnabled || !currentUser) return
    await supabase.from('backorder_orders').update({
      ...patch,
      eta: patch.eta === '' ? null : patch.eta,
      notes: patch.notes === '' ? null : patch.notes,
    }).eq('id', id).eq('user_id', currentUser.id)
  }

  const deleteOrder = async (id) => {
    setOrders(prev => prev.filter(o => o.id !== id))
    if (!supabaseEnabled || !currentUser) return
    await supabase.from('backorder_orders').delete().eq('id', id).eq('user_id', currentUser.id)
  }

  const openNew = (colId) => {
    setEditingOrder(null)
    setEditingDefaultCol(colId || 'intake')
    setModalOpen(true)
  }

  const openEdit = (order) => {
    setEditingOrder(order)
    setModalOpen(true)
  }

  const handleModalSave = async (data) => {
    if (editingOrder) await updateOrder(editingOrder.id, data)
    else await createOrder(data)
    setModalOpen(false)
  }

  const handleModalDelete = async () => {
    if (editingOrder) await deleteOrder(editingOrder.id)
    setModalOpen(false)
  }

  const handleMove = async (orderId, toCol) => {
    await updateOrder(orderId, { col: toCol })
    if (toCol === 'shipped') fireConfetti()
  }

  const handleDragStart = (id) => { dragIdRef.current = id }

  const handleSignOut = async () => {
    if (supabaseEnabled) await supabase.auth.signOut()
    setOrders(DEMO_ORDERS)
    setCurrentUser(null)
    setConnectionStatus('auth')
  }

  const handleDrop = async (toCol) => {
    if (!dragIdRef.current) return
    const order = orders.find(o => o.id === dragIdRef.current)
    if (order && order.col !== toCol) {
      await updateOrder(order.id, { col: toCol })
      if (toCol === 'shipped') fireConfetti()
    }
    dragIdRef.current = null
  }

  return (
    <>
      {supabaseEnabled && !currentUser && <AuthOverlay />}
      <Header
        orders={orders}
        connectionStatus={connectionStatus}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        onNewOrder={() => openNew('intake')}
        onSignOut={handleSignOut}
      />
      <Board
        columns={COLUMNS}
        orders={orders}
        onOpenNew={openNew}
        onOpenEdit={openEdit}
        onMove={handleMove}
        onDragStart={handleDragStart}
        onDrop={handleDrop}
      />
      {modalOpen && (
        <OrderModal
          order={editingOrder}
          onSave={handleModalSave}
          onDelete={handleModalDelete}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}

function fireConfetti() {
  const colors = ['#01696f', '#437a22', '#d19900', '#da7101', '#006494', '#a12c7b']
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div')
    p.className = 'confetti-piece'
    p.style.cssText = `left:${30 + Math.random() * 40}%;top:${20 + Math.random() * 30}%;background:${colors[Math.floor(Math.random() * colors.length)]};animation-delay:${Math.random() * 0.4}s;animation-duration:${0.8 + Math.random() * 0.6}s;`
    document.body.appendChild(p)
    setTimeout(() => p.remove(), 1500)
  }
}
