import { useState } from 'react'
import { Moon, Sun, Plus, LogOut, ArrowLeft, Pencil, Check } from 'lucide-react'

export default function Header({ selectedBoard, cards, connectionStatus, theme, onToggleTheme, onNewCard, onBack, onSignOut, onRenameBoard }) {
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')

  const active = cards.filter(c => c.col !== 'done').length
  const done = cards.filter(c => c.col === 'done').length

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
            <span className="logo-text">My<span>Boards</span></span>
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
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="My Boards logo">
      <rect width="28" height="28" rx="7" fill="var(--color-primary)" />
      <rect x="5" y="7" width="5" height="14" rx="2" fill="white" opacity="0.3" />
      <rect x="5" y="12" width="5" height="9" rx="2" fill="white" />
      <rect x="11.5" y="7" width="5" height="14" rx="2" fill="white" opacity="0.3" />
      <rect x="11.5" y="9" width="5" height="12" rx="2" fill="white" />
      <rect x="18" y="7" width="5" height="14" rx="2" fill="white" opacity="0.3" />
      <rect x="18" y="16" width="5" height="5" rx="2" fill="white" />
    </svg>
  )
}
