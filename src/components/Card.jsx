import { Pencil, User, ArrowLeft, ArrowRight } from 'lucide-react'

export default function Card({ order, columns, onEdit, onMove, onDragStart }) {
  const colIdx = columns.findIndex(c => c.id === order.col)
  const prevCol = colIdx > 0 ? columns[colIdx - 1] : null
  const nextCol = colIdx < columns.length - 1 ? columns[colIdx + 1] : null

  return (
    <div
      className="card"
      draggable
      onDragStart={() => onDragStart(order.id)}
    >
      <div className="card-top">
        <div className="card-title">{order.item}</div>
        <button className="card-menu-btn" onClick={e => { e.stopPropagation(); onEdit() }} aria-label="Edit order">
          <Pencil size={12} />
        </button>
      </div>
      <div className="card-meta">
        <span className={`badge badge-priority-${order.priority}`}>{order.priority}</span>
        {order.eta && (
          <span className="badge" style={{ background: 'var(--color-surface-offset)', color: 'var(--color-text-muted)' }}>
            {order.eta}
          </span>
        )}
      </div>
      <div className="card-customer">
        <User size={10} style={{ marginTop: 1, flexShrink: 0 }} />
        {order.customer}
      </div>
      {order.notes && <div className="card-notes">{order.notes}</div>}
      <div className="card-actions">
        {prevCol && (
          <button className="btn-move" onClick={() => onMove(order.id, prevCol.id)} aria-label={`Move back to ${prevCol.title}`}>
            <ArrowLeft size={10} />
          </button>
        )}
        {nextCol ? (
          <button className="btn-move btn-move-next" onClick={() => onMove(order.id, nextCol.id)}>
            Move to {nextCol.title} <ArrowRight size={10} />
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
