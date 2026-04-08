import { Moon, Sun, Plus, LogOut } from 'lucide-react'

export default function Header({ orders, connectionStatus, theme, onToggleTheme, onNewOrder, onSignOut }) {
  const active = orders.filter(o => o.col !== 'shipped').length
  const shipped = orders.filter(o => o.col === 'shipped').length

  return (
    <header className="app-header">
      <div className="logo">
        <LogoSvg />
        <span className="logo-text">Backorder<span>Track</span></span>
      </div>
      <div className="header-right">
        <div className="header-stats">
          <div className="stat-pill"><strong>{active}</strong> active</div>
          <div className="stat-pill"><strong>{shipped}</strong> shipped</div>
          <div className="stat-pill"><strong>{connectionStatus}</strong> mode</div>
        </div>
        <button className="btn-primary" onClick={onNewOrder} aria-label="Add new backorder">
          <Plus size={14} />
          New Order
        </button>
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
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="Backorder Tracker logo">
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
