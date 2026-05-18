import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function JoinScreen({ onJoin }) {
  const [username, setUsername] = useState('')
  const [groupCode, setGroupCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleJoin = async () => {
    const name = username.trim().toLowerCase().replace(/\s+/g, '_')
    const code = groupCode.trim().toUpperCase()

    if (!name || !code) {
      setError('Fill in both fields to join the board.')
      return
    }
    if (name.length < 2) {
      setError('Name must be at least 2 characters.')
      return
    }
    if (code.length < 3) {
      setError('Group code must be at least 3 characters.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Upsert: create if not exists, do nothing if exists
      const { error: upsertErr } = await supabase
        .from('drinks')
        .upsert(
          { username: name, group_code: code },
          { onConflict: 'group_code,username', ignoreDuplicates: true }
        )

      if (upsertErr) throw upsertErr

      localStorage.setItem('bb_username', name)
      localStorage.setItem('bb_group_code', code)
      onJoin(name, code)
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleJoin()
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-12 pt-safe">
      {/* Logo / Header */}
      <div className="text-center mb-10 animate-bounce-in">
        <div className="text-7xl mb-3" role="img" aria-label="beer">🍺</div>
        <h1 className="font-display text-7xl tracking-wider text-white leading-none">
          BEER
          <span
            className="block"
            style={{
              color: '#f59e0b',
              textShadow: '0 0 20px rgba(245,158,11,0.8), 0 0 60px rgba(245,158,11,0.4)',
            }}
          >
            BOARD
          </span>
        </h1>
        <p className="font-body text-white/40 text-sm mt-3 tracking-widest uppercase">
          Live drink leaderboard
        </p>
      </div>

      {/* Join Card */}
      <div
        className="w-full max-w-sm glass-card p-6 animate-slide-up"
        style={{ animationDelay: '0.15s', animationFillMode: 'both' }}
      >
        <div className="space-y-4">
          <div>
            <label className="font-body text-white/50 text-xs uppercase tracking-widest mb-2 block">
              Your Name
            </label>
            <input
              className="input-field"
              type="text"
              placeholder="e.g. big_dave"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={24}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="font-body text-white/50 text-xs uppercase tracking-widest mb-2 block">
              Group Code
            </label>
            <input
              className="input-field uppercase tracking-widest"
              type="text"
              placeholder="e.g. FRIDAY23"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              maxLength={16}
              autoCapitalize="characters"
              autoCorrect="off"
              autoComplete="off"
            />
            <p className="font-body text-white/30 text-xs mt-1.5">
              Share this code with your crew
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <p className="font-body text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full py-4 rounded-xl font-display text-2xl tracking-wider transition-all duration-200 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#07070f',
              boxShadow: '0 0 24px rgba(245,158,11,0.4)',
            }}
          >
            {loading ? '⏳ JOINING...' : '🍺 JOIN BOARD'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="font-body text-white/20 text-xs text-center mt-10 px-8 pb-safe">
        Drink responsibly. Don&apos;t pressure people to drink.
      </p>
    </div>
  )
}
