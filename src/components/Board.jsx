import Column from './Column'

export default function Board({ columns, cards, onOpenNew, onOpenEdit, onMove, onDragStart, onDrop }) {
  return (
    <main className="board-container">
      <div className="board">
        {columns.map(col => (
          <Column
            key={col.id}
            col={col}
            columns={columns}
            cards={cards.filter(c => c.col === col.id)}
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
