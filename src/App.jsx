import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase, supabaseEnabled } from './lib/supabase'
import AuthOverlay from './components/AuthOverlay'
import Header from './components/Header'
import BoardList from './components/BoardList'
import Board from './components/Board'
import CardModal from './components/CardModal'

export const COLUMNS = [
  { id: 'todo',        title: 'To Do',       icon: 'circle',       desc: 'Not started yet' },
  { id: 'in_progress', title: 'In Progress',  icon: 'zap',          desc: 'Currently working on' },
  { id: 'review',      title: 'Review',       icon: 'eye',          desc: 'Ready for review' },
  { id: 'done',        title: 'Done',         icon: 'check-circle', desc: 'Completed' },
]

function uid() { return 'id_' + Math.random().toString(36).slice(2, 9) }

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('local')
  const [boards, setBoards] = useState([])
  const [selectedBoard, setSelectedBoard] = useState(null)
  const [cards, setCards] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [editingDefaultCol, setEditingDefaultCol] = useState('todo')
  const [theme, setTheme] = useState(() =>
    matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )
  const realtimeRef = useRef(null)
  const dragIdRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // ── Boards ──
  const loadBoards = useCallback(async () => {
    if (!supabaseEnabled || !currentUser) return
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: true })
    if (!error && data) setBoards(data)
  }, [currentUser])

  const createBoard = async (name) => {
    if (!supabaseEnabled || !currentUser) {
      const board = { id: uid(), name, user_id: 'local', created_at: new Date().toISOString() }
      setBoards(prev => [...prev, board])
      return board
    }
    const { data, error } = await supabase
      .from('boards')
      .insert({ name, user_id: currentUser.id })
      .select()
      .single()
    if (!error && data) setBoards(prev => [...prev, data])
    return data
  }

  const deleteBoard = async (id) => {
    setBoards(prev => prev.filter(b => b.id !== id))
    if (selectedBoard?.id === id) { setSelectedBoard(null); setCards([]) }
    if (!supabaseEnabled || !currentUser) return
    await supabase.from('boards').delete().eq('id', id).eq('user_id', currentUser.id)
  }

  const renameBoard = async (id, name) => {
    setBoards(prev => prev.map(b => b.id === id ? { ...b, name } : b))
    if (selectedBoard?.id === id) setSelectedBoard(prev => ({ ...prev, name }))
    if (!supabaseEnabled || !currentUser) return
    await supabase.from('boards').update({ name }).eq('id', id).eq('user_id', currentUser.id)
  }

  // ── Cards ──
  const loadCards = useCallback(async (boardId) => {
    if (!supabaseEnabled || !currentUser) return
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('board_id', boardId)
      .order('created_at', { ascending: true })
    if (!error && data) {
      setCards(data.map(row => ({
        id: row.id, col: row.col, title: row.title,
        description: row.description || '', priority: row.priority,
        due_date: row.due_date || '', board_id: row.board_id,
      })))
    }
  }, [currentUser])

  const subscribeRealtime = useCallback((boardId) => {
    if (!supabaseEnabled || !currentUser) return
    if (realtimeRef.current) supabase.removeChannel(realtimeRef.current)
    realtimeRef.current = supabase
      .channel(`board-${boardId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'cards',
        filter: `board_id=eq.${boardId}`,
      }, () => loadCards(boardId))
      .subscribe()
  }, [currentUser, loadCards])

  const selectBoard = (board) => {
    setSelectedBoard(board)
    setCards([])
    loadCards(board.id)
    subscribeRealtime(board.id)
  }

  const createCard = async (data) => {
    if (!supabaseEnabled || !currentUser) {
      setCards(prev => [...prev, { id: uid(), col: editingDefaultCol, board_id: selectedBoard.id, ...data }])
      return
    }
    await supabase.from('cards').insert({
      board_id: selectedBoard.id,
      col: editingDefaultCol,
      title: data.title,
      description: data.description || null,
      priority: data.priority,
      due_date: data.due_date || null,
      user_id: currentUser.id,
    })
  }

  const updateCard = async (id, patch) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
    if (!supabaseEnabled || !currentUser) return
    await supabase.from('cards').update({
      ...patch,
      due_date: patch.due_date === '' ? null : patch.due_date,
      description: patch.description === '' ? null : patch.description,
    }).eq('id', id).eq('user_id', currentUser.id)
  }

  const deleteCard = async (id) => {
    setCards(prev => prev.filter(c => c.id !== id))
    if (!supabaseEnabled || !currentUser) return
    await supabase.from('cards').delete().eq('id', id).eq('user_id', currentUser.id)
  }

  // ── Auth ──
  useEffect(() => {
    if (!supabaseEnabled) { setConnectionStatus('local'); return }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user || null
      setCurrentUser(user)
      if (user) { setConnectionStatus('live'); loadBoards() }
      else setConnectionStatus('auth')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null
      setCurrentUser(user)
      if (user) { setBoards([]); setConnectionStatus('live'); loadBoards() }
      else { setConnectionStatus('auth'); setBoards([]); setSelectedBoard(null); setCards([]) }
    })

    return () => {
      subscription.unsubscribe()
      if (realtimeRef.current) supabase.removeChannel(realtimeRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignOut = async () => {
    if (supabaseEnabled) await supabase.auth.signOut()
    setBoards([]); setSelectedBoard(null); setCards([])
    setCurrentUser(null); setConnectionStatus('auth')
  }

  // ── Modal ──
  const openNew = (colId) => {
    setEditingCard(null)
    setEditingDefaultCol(colId || 'todo')
    setModalOpen(true)
  }

  const openEdit = (card) => { setEditingCard(card); setModalOpen(true) }

  const handleModalSave = async (data) => {
    if (editingCard) await updateCard(editingCard.id, data)
    else await createCard(data)
    setModalOpen(false)
  }

  const handleModalDelete = async () => {
    if (editingCard) await deleteCard(editingCard.id)
    setModalOpen(false)
  }

  const handleMove = async (cardId, toCol) => {
    await updateCard(cardId, { col: toCol })
    if (toCol === 'done') fireConfetti()
  }

  const handleDragStart = (id) => { dragIdRef.current = id }

  const handleDrop = async (toCol) => {
    if (!dragIdRef.current) return
    const card = cards.find(c => c.id === dragIdRef.current)
    if (card && card.col !== toCol) {
      await updateCard(card.id, { col: toCol })
      if (toCol === 'done') fireConfetti()
    }
    dragIdRef.current = null
  }

  return (
    <>
      {supabaseEnabled && !currentUser && <AuthOverlay />}
      <Header
        selectedBoard={selectedBoard}
        cards={cards}
        connectionStatus={connectionStatus}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        onNewCard={() => openNew('todo')}
        onBack={() => { setSelectedBoard(null); setCards([]) }}
        onSignOut={handleSignOut}
        onRenameBoard={renameBoard}
      />
      {!selectedBoard ? (
        <BoardList
          boards={boards}
          onSelect={selectBoard}
          onCreate={createBoard}
          onDelete={deleteBoard}
        />
      ) : (
        <Board
          columns={COLUMNS}
          cards={cards}
          onOpenNew={openNew}
          onOpenEdit={openEdit}
          onMove={handleMove}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
        />
      )}
      {modalOpen && (
        <CardModal
          card={editingCard}
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
