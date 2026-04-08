import { useState } from 'react'
import { Circle, Zap, Eye, CheckCircle, Plus, Inbox } from 'lucide-react'
import Card from './Card'

const ICON_MAP = {
  'circle': Circle,
  'zap': Zap,
  'eye': Eye,
  'check-circle': CheckCircle,
}

export default function Column({ col, columns, cards, onOpenNew, onOpenEdit, onMove, onDragStart, onDrop }) {
  const [dragOver, setDragOver] = useState(false)
  const Icon = ICON_MAP[col.icon] || Circle

  return (
    <div className="column" data-col={col.id}>
      <div className="column-header">
        <div className="col-icon"><Icon size={14} /></div>
        <span className="col-title">{col.title}</span>
        <span className="col-count">{cards.length}</span>
      </div>
      <div className="col-step">{col.desc}</div>
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
