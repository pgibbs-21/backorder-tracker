import { useState } from 'react'
import { Search, CheckCircle, PackageSearch, Truck, Plus, Inbox } from 'lucide-react'
import Card from './Card'

const ICON_MAP = {
  'search': Search,
  'check-circle': CheckCircle,
  'package-search': PackageSearch,
  'truck': Truck,
}

export default function Column({ col, columns, orders, onOpenNew, onOpenEdit, onMove, onDragStart, onDrop }) {
  const [dragOver, setDragOver] = useState(false)
  const Icon = ICON_MAP[col.icon] || Search

  return (
    <div className="column" data-col={col.id}>
      <div className="column-header">
        <div className="col-icon"><Icon size={14} /></div>
        <span className="col-title">{col.title}</span>
        <span className="col-count">{orders.length}</span>
      </div>
      <div className="col-step">{col.step} — {col.desc}</div>
      <div
        className={`cards-list${dragOver ? ' drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); onDrop(col.id) }}
      >
        {orders.length === 0 ? (
          <div className="empty-state">
            <Inbox size={24} />
            <p>No orders here</p>
          </div>
        ) : (
          orders.map(order => (
            <Card
              key={order.id}
              order={order}
              columns={columns}
              onEdit={() => onOpenEdit(order)}
              onMove={onMove}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
      <button className="add-card-btn" onClick={() => onOpenNew(col.id)}>
        <Plus size={12} /> Add order
      </button>
    </div>
  )
}
