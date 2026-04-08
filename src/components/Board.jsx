import Column from './Column'

export default function Board({ columns, orders, onOpenNew, onOpenEdit, onMove, onDragStart, onDrop }) {
  return (
    <main className="board-container">
      <div className="board">
        {columns.map(col => (
          <Column
            key={col.id}
            col={col}
            columns={columns}
            orders={orders.filter(o => o.col === col.id)}
            onOpenNew={onOpenNew}
            onOpenEdit={onOpenEdit}
            onMove={onMove}
            onDragStart={onDragStart}
            onDrop={onDrop}
          />
        ))}
      </div>
    </main>
  )
}
