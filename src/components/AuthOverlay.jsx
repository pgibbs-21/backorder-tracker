import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthOverlay() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState({ text: '', type: '' })
  const [busy, setBusy] = useState(false)

  const clear = () => { setError(''); setStatus({ text: '', type: '' }) }

  const handleForgotPassword = async () => {
    if (!email) { setError('Enter your email first.'); return }
    clear()
    setBusy(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    if (err) setError(err.message)
    else setStatus({ text: 'Password reset email sent. Check your inbox.', type: 'success' })
    setBusy(false)
  }

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
          <span className="logo-text">Backcountry</span>
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
          <button type="button" className="auth-forgot" onClick={handleForgotPassword} disabled={busy}>
            Forgot password?
          </button>
          {error && <div className="auth-error">{error}</div>}
          {status.text && <div className={`auth-status ${status.type}`}>{status.text}</div>}
        </form>
        <p className="auth-note">Need access? Reach out to get an invite sent to your work email.</p>
      </div>
    </div>
  )
}

function LogoSvg() {
  return <img src="/backcountry-goat.jpg" alt="Backcountry logo" className="brand-logo-lg" />
}
