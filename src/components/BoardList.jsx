import { useState } from 'react'
import { Plus, Trash2, LayoutDashboard } from 'lucide-react'

export default function BoardList({ boards, onSelect, onCreate, onDelete }) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    await onCreate(newName.trim())
    setNewName('')
    setCreating(false)
  }

  return (
    <main className="board-list-container">
      <div className="board-list-header">
        <h1 className="board-list-title">Your Boards</h1>
        <button className="btn-primary" onClick={() => setCreating(true)}>
          <Plus size={14} /> New Board
        </button>
      </div>

      {creating && (
        <form className="create-board-form" onSubmit={handleCreate}>
          <input
            className="form-input"
            placeholder="Board name..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            autoFocus
            required
          />
          <button type="submit" className="btn-save">Create</button>
          <button type="button" className="btn-cancel" onClick={() => { setCreating(false); setNewName('') }}>
            Cancel
          </button>
        </form>
      )}

      {boards.length === 0 && !creating ? (
        <div className="board-list-empty">
          <LayoutDashboard size={48} />
          <p>No boards yet.</p>
          <p>Create your first board to get started.</p>
        </div>
      ) : (
        <div className="board-grid">
          {boards.map(board => (
            <div key={board.id} className="board-card" onClick={() => onSelect(board)}>
              <div className="board-card-icon">
                <LayoutDashboard size={22} />
              </div>
              <div className="board-card-name">{board.name}</div>
              <div className="board-card-date">
                {new Date(board.created_at).toLocaleDateString()}
              </div>
              <button
                className="board-card-delete"
                onClick={e => { e.stopPropagation(); onDelete(board.id) }}
                aria-label="Delete board"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
