import { useState } from 'react'
import { Moon, Sun, Plus, LogOut, ArrowLeft, Pencil, Check } from 'lucide-react'

export default function Header({ selectedBoard, cards, columns, connectionStatus, theme, onToggleTheme, onNewCard, onBack, onSignOut, onRenameBoard }) {
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')

  const lastColId = columns[columns.length - 1]?.id
  const done = cards.filter(c => c.column_id === lastColId).length
  const active = cards.length - done

  const startRename = () => {
    setRenameValue(selectedBoard.name)
    setRenaming(true)
  }

  const submitRename = (e) => {
    e?.preventDefault()
    if (renameValue.trim()) onRenameBoard(selectedBoard.id, renameValue.trim())
    setRenaming(false)
  }

  return (
    <header className="app-header">
      <div className="logo">
        {selectedBoard ? (
          <>
            <button className="btn-icon" onClick={onBack} aria-label="Back to boards">
              <ArrowLeft size={18} />
            </button>
            {renaming ? (
              <form onSubmit={submitRename} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input
                  className="board-rename-input"
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={submitRename}
                  autoFocus
                />
                <button type="submit" className="btn-icon"><Check size={16} /></button>
              </form>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span className="logo-text">{selectedBoard.name}</span>
                <button className="btn-icon" onClick={startRename} aria-label="Rename board">
                  <Pencil size={14} />
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <LogoSvg />
            <span className="logo-text">Backcountry Kanban Boards</span>
          </>
        )}
      </div>

      <div className="header-right">
        {selectedBoard ? (
          <>
            <div className="header-stats">
              <div className="stat-pill"><strong>{active}</strong> active</div>
              <div className="stat-pill"><strong>{done}</strong> done</div>
              <div className="stat-pill"><strong>{connectionStatus}</strong> mode</div>
            </div>
            <button className="btn-primary" onClick={onNewCard} aria-label="Add new card">
              <Plus size={14} /> New Card
            </button>
          </>
        ) : (
          <div className="stat-pill"><strong>{connectionStatus}</strong> mode</div>
        )}
        <button className="btn-icon" onClick={onToggleTheme} aria-label="Toggle dark mode">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {onSignOut && (
          <button className="btn-icon" onClick={onSignOut} aria-label="Sign out">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </header>
  )
}

function LogoSvg() {
  return <img src="/backcountry-goat.jpg" alt="Backcountry logo" className="brand-logo" />
}
