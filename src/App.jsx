import { useState, useEffect, useRef } from 'react'
import { supabase, supabaseEnabled } from './lib/supabase'
import AuthOverlay from './components/AuthOverlay'
import SetPassword from './components/SetPassword'
import Header from './components/Header'
import BoardList from './components/BoardList'
import Board from './components/Board'
import CardModal from './components/CardModal'

function uid() { return 'id_' + Math.random().toString(36).slice(2, 9) }

const DEFAULT_COLUMNS = ['To Do', 'In Progress', 'Done']

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('local')
  const [boards, setBoards] = useState([])
  const [selectedBoard, setSelectedBoard] = useState(null)
  const [columns, setColumns] = useState([])
  const [cards, setCards] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [editingDefaultCol, setEditingDefaultCol] = useState(null)
  const [theme, setTheme] = useState(() =>
    matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )
  const [passwordFlow, setPasswordFlow] = useState(null)
  const realtimeRef = useRef(null)
  const dragIdRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // ── Boards ──
  const loadBoards = async (userId) => {
    if (!supabaseEnabled || !userId) return
    const { data, error } = await supabase
      .from('boards').select('*').eq('user_id', userId).order('created_at', { ascending: true })
    if (!error && data) setBoards(data)
  }

  const createBoard = async (name) => {
    if (!supabaseEnabled || !currentUser) {
      const board = { id: uid(), name, created_at: new Date().toISOString() }
      const cols = DEFAULT_COLUMNS.map((title, i) => ({ id: uid(), board_id: board.id, title, position: i }))
      setBoards(prev => [...prev, board])
      return { board, cols }
    }
    const { data: board, error } = await supabase
      .from('boards').insert({ name, user_id: currentUser.id }).select().single()
    if (error || !board) return
    await supabase.from('columns').insert(
      DEFAULT_COLUMNS.map((title, i) => ({ board_id: board.id, title, position: i, user_id: currentUser.id }))
    )
    setBoards(prev => [...prev, board])
    return board
  }

  const deleteBoard = async (id) => {
    setBoards(prev => prev.filter(b => b.id !== id))
    if (selectedBoard?.id === id) { setSelectedBoard(null); setColumns([]); setCards([]) }
    if (!supabaseEnabled || !currentUser) return
    await supabase.from('boards').delete().eq('id', id).eq('user_id', currentUser.id)
  }

  const renameBoard = async (id, name) => {
    setBoards(prev => prev.map(b => b.id === id ? { ...b, name } : b))
    if (selectedBoard?.id === id) setSelectedBoard(prev => ({ ...prev, name }))
    if (!supabaseEnabled || !currentUser) return
    await supabase.from('boards').update({ name }).eq('id', id).eq('user_id', currentUser.id)
  }

  // ── Columns ──
  const loadColumns = async (boardId) => {
    if (!supabaseEnabled || !boardId) return
    const { data, error } = await supabase
      .from('columns').select('*').eq('board_id', boardId).order('position', { ascending: true })
    if (!error && data) setColumns(data)
  }

  const addColumn = async (title) => {
    const position = columns.length
    if (!supabaseEnabled || !currentUser) {
      setColumns(prev => [...prev, { id: uid(), board_id: selectedBoard.id, title, position }])
      return
    }
    const { data, error } = await supabase
      .from('columns')
      .insert({ board_id: selectedBoard.id, title, position, user_id: currentUser.id })
      .select().single()
    if (!error && data) setColumns(prev => [...prev, data])
  }

  const updateColumn = async (id, patch) => {
    setColumns(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
    if (!supabaseEnabled || !currentUser) return
    await supabase.from('columns').update(patch).eq('id', id).eq('user_id', currentUser.id)
  }

  const deleteColumn = async (id) => {
    setColumns(prev => prev.filter(c => c.id !== id))
    setCards(prev => prev.filter(c => c.column_id !== id))
    if (!supabaseEnabled || !currentUser) return
    await supabase.from('columns').delete().eq('id', id).eq('user_id', currentUser.id)
  }

  // ── Cards ──
  const loadCards = async (boardId) => {
    if (!supabaseEnabled || !boardId) return
    const { data, error } = await supabase
      .from('cards').select('*').eq('board_id', boardId).order('created_at', { ascending: true })
    if (!error && data) {
      setCards(data.map(row => ({
        id: row.id, column_id: row.column_id, board_id: row.board_id,
        title: row.title, description: row.description || '',
        priority: row.priority, due_date: row.due_date || '',
      })))
    }
  }

  const subscribeRealtime = (boardId) => {
    if (!supabaseEnabled || !boardId) return
    if (realtimeRef.current) supabase.removeChannel(realtimeRef.current)
    realtimeRef.current = supabase
      .channel(`board-${boardId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cards', filter: `board_id=eq.${boardId}` },
        () => loadCards(boardId))
      .subscribe()
  }, [currentUser, loadCards])

  const selectBoard = (board) => {
    setSelectedBoard(board)
    setColumns([])
    setCards([])
    loadColumns(board.id)
    loadCards(board.id)
    subscribeRealtime(board.id)
  }

  const createCard = async (data) => {
    const colId = editingDefaultCol || columns[0]?.id
    if (!colId) return
    if (!supabaseEnabled || !currentUser) {
      setCards(prev => [...prev, { id: uid(), column_id: colId, board_id: selectedBoard.id, ...data }])
      return
    }
    const { data: card, error } = await supabase.from('cards').insert({
      board_id: selectedBoard.id, column_id: colId,
      title: data.title, description: data.description || null,
      priority: data.priority, due_date: data.due_date || null,
      user_id: currentUser.id,
    }).select().single()
    if (!error && card) {
      setCards(prev => [...prev, {
        id: card.id, column_id: card.column_id, board_id: card.board_id,
        title: card.title, description: card.description || '',
        priority: card.priority, due_date: card.due_date || '',
      }])
    }
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
      if (user) { setConnectionStatus('live'); loadBoards(user.id) }
      else setConnectionStatus('auth')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordFlow('recovery'); setCurrentUser(session?.user || null); return
      }
      if (event === 'SIGNED_IN' && window.location.hash.includes('type=invite')) {
        setPasswordFlow('invite'); setCurrentUser(session?.user || null)
        window.history.replaceState(null, '', window.location.pathname); return
      }
      const user = session?.user || null
      setCurrentUser(user)
      if (user) { setBoards([]); setConnectionStatus('live'); loadBoards(user.id) }
      else { setConnectionStatus('auth'); setBoards([]); setSelectedBoard(null); setColumns([]); setCards([]) }
    })

    return () => {
      subscription.unsubscribe()
      if (realtimeRef.current) supabase.removeChannel(realtimeRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignOut = async () => {
    if (supabaseEnabled) await supabase.auth.signOut()
    setBoards([]); setSelectedBoard(null); setColumns([]); setCards([])
    setCurrentUser(null); setConnectionStatus('auth')
  }

  // ── Modal ──
  const openNew = (columnId) => {
    setEditingCard(null)
    setEditingDefaultCol(columnId || columns[0]?.id)
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

  const handleMove = async (cardId, toColumnId) => {
    await updateCard(cardId, { column_id: toColumnId })
    if (columns[columns.length - 1]?.id === toColumnId) fireConfetti()
  }

  const handleDragStart = (id) => { dragIdRef.current = id }

  const handleDrop = async (toColumnId) => {
    if (!dragIdRef.current) return
    const card = cards.find(c => c.id === dragIdRef.current)
    if (card && card.column_id !== toColumnId) {
      await updateCard(card.id, { column_id: toColumnId })
      if (columns[columns.length - 1]?.id === toColumnId) fireConfetti()
    }
    dragIdRef.current = null
  }

  if (passwordFlow) {
    return (
      <SetPassword
        isInvite={passwordFlow === 'invite'}
        onDone={async () => {
          setPasswordFlow(null)
          setConnectionStatus('live')
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) loadBoards(session.user.id)
        }}
      />
    )
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
        onNewCard={() => openNew(columns[0]?.id)}
        onBack={() => { setSelectedBoard(null); setColumns([]); setCards([]) }}
        onSignOut={handleSignOut}
        onRenameBoard={renameBoard}
      />
      {!selectedBoard ? (
        <BoardList boards={boards} onSelect={selectBoard} onCreate={createBoard} onDelete={deleteBoard} />
      ) : (
        <Board
          columns={columns}
          cards={cards}
          onOpenNew={openNew}
          onOpenEdit={openEdit}
          onMove={handleMove}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onAddColumn={addColumn}
          onUpdateColumn={updateColumn}
          onDeleteColumn={deleteColumn}
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
