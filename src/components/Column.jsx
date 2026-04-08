import { useState, useRef } from 'react'
import { Plus, Inbox, Pencil, Trash2, Check } from 'lucide-react'
import Card from './Card'

export default function Column({ col, columns, cards, onOpenNew, onOpenEdit, onMove, onDragStart, onDrop, onRename, onDelete }) {
  const [dragOver, setDragOver] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(col.title)
  const inputRef = useRef(null)

  const startRename = () => {
    setRenameValue(col.title)
    setRenaming(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const submitRename = (e) => {
    e?.preventDefault()
    if (renameValue.trim() && renameValue.trim() !== col.title) onRename(renameValue.trim())
    setRenaming(false)
  }

  const handleDeleteClick = () => {
    if (cards.length > 0) {
      if (!window.confirm(`Delete "${col.title}"? The ${cards.length} card(s) inside will also be deleted.`)) return
    }
    onDelete()
  }

  return (
    <div className="column">
      <div className="column-header">
        <div className="col-title-area">
          {renaming ? (
            <form onSubmit={submitRename} style={{ flex: 1, display: 'flex', gap: 'var(--space-1)' }}>
              <input
                ref={inputRef}
                className="col-rename-input"
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={submitRename}
                onKeyDown={e => e.key === 'Escape' && setRenaming(false)}
              />
              <button type="submit" className="btn-icon" style={{ width: 24, height: 24 }}>
                <Check size={12} />
              </button>
            </form>
          ) : (
            <span className="col-title">{col.title}</span>
          )}
        </div>
        <span className="col-count">{cards.length}</span>
        {!renaming && (
          <div className="col-actions">
            <button className="col-action-btn" onClick={startRename} aria-label="Rename column">
              <Pencil size={12} />
            </button>
            <button className="col-action-btn col-action-delete" onClick={handleDeleteClick} aria-label="Delete column">
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
      <div
        className={`cards-list${dragOver ? ' drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); onDrop(col.id) }}
      >
        {cards.length === 0 ? (
          <div className="empty-state">
            <Inbox size={24} />
            <p>No cards here</p>
          </div>
        ) : (
          cards.map(card => (
            <Card
              key={card.id}
              card={card}
              columns={columns}
              onEdit={() => onOpenEdit(card)}
              onMove={onMove}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
      <button className="add-card-btn" onClick={() => onOpenNew(col.id)}>
        <Plus size={12} /> Add card
      </button>
    </div>
  )
}
