import { Pencil, ArrowLeft, ArrowRight, Calendar } from 'lucide-react'

export default function Card({ card, columns, onEdit, onMove, onDragStart }) {
  const colIdx = columns.findIndex(c => c.id === card.column_id)
  const prevCol = colIdx > 0 ? columns[colIdx - 1] : null
  const nextCol = colIdx < columns.length - 1 ? columns[colIdx + 1] : null

  return (
    <div className="card" draggable onDragStart={() => onDragStart(card.id)}>
      <div className="card-top">
        <div className="card-title">{card.title}</div>
        <button className="card-menu-btn" onClick={e => { e.stopPropagation(); onEdit() }} aria-label="Edit card">
          <Pencil size={12} />
        </button>
      </div>
      <div className="card-meta">
        <span className={`badge badge-priority-${card.priority}`}>{card.priority}</span>
        {card.due_date && (
          <span className="badge" style={{ background: 'var(--color-surface-offset)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Calendar size={10} />{card.due_date}
          </span>
        )}
      </div>
      {card.description && <div className="card-notes">{card.description}</div>}
      <div className="card-actions">
        {prevCol && (
          <button className="btn-move" onClick={() => onMove(card.id, prevCol.id)} aria-label={`Move back to ${prevCol.title}`}>
            <ArrowLeft size={10} />
          </button>
        )}
        {nextCol ? (
          <button className="btn-move btn-move-next" onClick={() => onMove(card.id, nextCol.id)}>
            {nextCol.title} <ArrowRight size={10} />
          </button>
        ) : (
          <span style={{ flex: 1, textAlign: 'center', fontSize: 11, color: 'var(--color-success)', fontWeight: 600 }}>
            ✓ Complete
          </span>
        )}
      </div>
    </div>
  )
}
