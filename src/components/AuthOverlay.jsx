import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthOverlay() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState({ text: '', type: '' })
  const [busy, setBusy] = useState(false)

  const clear = () => { setError(''); setStatus({ text: '', type: '' }) }

  const handleSignIn = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Enter email and password first.'); return }
    clear()
    setBusy(true)
    setStatus({ text: 'Signing in...', type: 'pending' })
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError(err.message); setStatus({ text: '', type: '' }) }
      else setStatus({ text: 'Signed in. Loading board...', type: 'success' })
    } catch (err) {
      setError(err?.message || 'Sign in failed.')
      setStatus({ text: '', type: '' })
    } finally {
      setBusy(false)
    }
  }

return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="logo" style={{ marginBottom: 'var(--space-4)' }}>
          <LogoSvg />
          <span className="logo-text">Backorder<span>Track</span></span>
        </div>
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-copy">This app is invite only. If you don't have access, contact the boss to get set up.</p>
        <form className="auth-stack" onSubmit={handleSignIn}>
          <input
            className="form-input"
            type="email"
            placeholder="Work email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <input
            className="form-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-save" disabled={busy}>Sign in</button>
          {error && <div className="auth-error">{error}</div>}
          {status.text && <div className={`auth-status ${status.type}`}>{status.text}</div>}
        </form>
        <p className="auth-note">Need access? Reach out to get an invite sent to your work email.</p>
      </div>
    </div>
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
