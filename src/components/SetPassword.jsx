import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function SetPassword({ onDone, isInvite }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setBusy(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) { setError(err.message); setBusy(false) }
    else onDone()
  }

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="logo" style={{ marginBottom: 'var(--space-4)' }}>
          <LogoSvg />
          <span className="logo-text">My<span>Boards</span></span>
        </div>
        <h1 className="auth-title">{isInvite ? 'Welcome! Set your password' : 'Set a new password'}</h1>
        <p className="auth-copy">
          {isInvite
            ? 'You\'ve been invited. Choose a password to finish setting up your account.'
            : 'Enter a new password for your account.'}
        </p>
        <form className="auth-stack" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="form-input"
            type="password"
            placeholder="New password (min 8 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <input
            className="form-input"
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
          <button type="submit" className="btn-save" disabled={busy}>
            {busy ? 'Saving...' : 'Set Password & Sign In'}
          </button>
          {error && <div className="auth-error">{error}</div>}
        </form>
      </div>
    </div>
  )
}

function LogoSvg() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
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
