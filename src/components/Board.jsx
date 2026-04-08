import { useState, useRef } from 'react'
import { Plus, Check } from 'lucide-react'
import Column from './Column'

export default function Board({ columns, cards, onOpenNew, onOpenEdit, onMove, onDragStart, onDrop, onAddColumn, onUpdateColumn, onDeleteColumn }) {
  return (
    <main className="board-container">
      <div className="board">
        {columns.map(col => (
          <Column
            key={col.id}
            col={col}
            columns={columns}
            cards={cards.filter(c => c.column_id === col.id)}
            onOpenNew={onOpenNew}
            onOpenEdit={onOpenEdit}
            onMove={onMove}
            onDragStart={onDragStart}
            onDrop={onDrop}
            onRename={(title) => onUpdateColumn(col.id, { title })}
            onDelete={() => onDeleteColumn(col.id)}
          />
        ))}
        <AddColumnButton onAdd={onAddColumn} />
      </div>
    </main>
  )
}

function AddColumnButton({ onAdd }) {
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const inputRef = useRef(null)

  const open = () => { setAdding(true); setTimeout(() => inputRef.current?.focus(), 0) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) { onAdd(title.trim()); setTitle('') }
    setAdding(false)
  }

  if (adding) {
    return (
      <div className="column column-new">
        <form onSubmit={handleSubmit} style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <input
            ref={inputRef}
            className="form-input"
            placeholder="Column name..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && setAdding(false)}
          />
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button type="submit" className="btn-save" style={{ flex: 1 }}>
              <Check size={14} /> Add
            </button>
            <button type="button" className="btn-cancel" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <button className="add-column-btn" onClick={open}>
      <Plus size={16} /> Add Column
    </button>
  )
}
