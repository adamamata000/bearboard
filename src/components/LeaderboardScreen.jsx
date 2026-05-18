import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

// Ripple helper
function createRipple(e, color) {
  const button = e.currentTarget
  const circle = document.createElement('span')
  const diameter = Math.max(button.clientWidth, button.clientHeight)
  const rect = button.getBoundingClientRect()
  const x = e.clientX - rect.left - diameter / 2
  const y = e.clientY - rect.top - diameter / 2
  circle.style.cssText = `
    width: ${diameter}px; height: ${diameter}px;
    left: ${x}px; top: ${y}px;
    background: ${color};
    position: absolute;
    border-radius: 50%;
    transform: scale(0);
    animation: ripple-anim 0.5s linear;
    pointer-events: none;
    opacity: 0.4;
  `
  const existing = button.querySelector('.ripple')
  if (existing) existing.remove()
  circle.classList.add('ripple')
  button.appendChild(circle)
  circle.addEventListener('animationend', () => circle.remove())
}

// Rank badge colors
function RankBadge({ rank }) {
  const styles = {
    1: { bg: 'rgba(245,158,11,0.3)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.6)', shadow: '0 0 12px rgba(245,158,11,0.5)' },
    2: { bg: 'rgba(156,163,175,0.2)', color: '#9ca3af', border: '1px solid rgba(156,163,175,0.4)', shadow: 'none' },
    3: { bg: 'rgba(180,120,60,0.2)', color: '#cd7f32', border: '1px solid rgba(180,120,60,0.4)', shadow: 'none' },
  }
  const s = styles[rank] || { bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)', shadow: 'none' }
  return (
    <div
      className="rank-badge flex-shrink-0"
      style={{ background: s.bg, color: s.color, border: s.border, boxShadow: s.shadow }}
    >
      {rank <= 3 ? ['🥇','🥈','🥉'][rank - 1] : rank}
    </div>
  )
}

// Floating +1 animation
function FloatUp({ id, type }) {
  return (
    <div
      key={id}
      className="absolute pointer-events-none font-display text-2xl"
      style={{
        color: type === 'beer' ? '#f59e0b' : '#14b8a6',
        textShadow: type === 'beer' ? '0 0 10px rgba(245,158,11,0.8)' : '0 0 10px rgba(20,184,166,0.8)',
        animation: 'float-up 0.8s ease-out forwards',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
      }}
    >
      +1
    </div>
  )
}

export default function LeaderboardScreen({ username, groupCode, onLeave }) {
  const [users, setUsers] = useState([])
  const [myStats, setMyStats] = useState({ total_count: 0, beer_count: 0, liquor_count: 0 })
  const [loading, setLoading] = useState(true)
  const [floats, setFloats] = useState([])
  const [pressing, setPressing] = useState(null)
  const channelRef = useRef(null)

  const fetchLeaderboard = useCallback(async () => {
    const { data, error } = await supabase
      .from('drinks')
      .select('*')
      .eq('group_code', groupCode)
      .order('total_count', { ascending: false })

    if (!error && data) {
      setUsers(data)
      const me = data.find((u) => u.username === username)
      if (me) setMyStats({ total_count: me.total_count, beer_count: me.beer_count, liquor_count: me.liquor_count })
    }
    setLoading(false)
  }, [groupCode, username])

  // Realtime subscription
  useEffect(() => {
    fetchLeaderboard()

    channelRef.current = supabase
      .channel(`group:${groupCode}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'drinks', filter: `group_code=eq.${groupCode}` },
        () => { fetchLeaderboard() }
      )
      .subscribe()

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [fetchLeaderboard, groupCode])

  const addFloat = (type) => {
    const id = Date.now()
    setFloats((f) => [...f, { id, type }])
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 900)
  }

  const handleDrink = async (type, e) => {
    createRipple(e, type === 'beer' ? 'rgba(245,158,11,0.5)' : 'rgba(20,184,166,0.5)')
    setPressing(type)
    setTimeout(() => setPressing(null), 150)
    addFloat(type)

    // Optimistic update
    const updates =
      type === 'beer'
        ? { beer_count: myStats.beer_count + 1, total_count: myStats.total_count + 1 }
        : { liquor_count: myStats.liquor_count + 1, total_count: myStats.total_count + 1 }

    setMyStats((s) => ({ ...s, ...updates }))

    const { error } = await supabase
      .from('drinks')
      .update(updates)
      .eq('group_code', groupCode)
      .eq('username', username)

    if (error) {
      console.error('Update failed:', error)
      fetchLeaderboard() // Revert on error
    }
  }

  const handleReset = async () => {
    if (!window.confirm(`Reset ALL counts for group "${groupCode}"?`)) return
    await supabase
      .from('drinks')
      .update({ total_count: 0, beer_count: 0, liquor_count: 0 })
      .eq('group_code', groupCode)
    fetchLeaderboard()
  }

  const isAdmin = username === 'admin'

  return (
    <div className="min-h-dvh flex flex-col pt-safe pb-safe">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-4 pb-3">
        <div>
          <h1
            className="font-display text-3xl tracking-wider leading-none"
            style={{ color: '#f59e0b', textShadow: '0 0 12px rgba(245,158,11,0.6)' }}
          >
            BEERBOARD
          </h1>
          <p className="font-body text-white/30 text-xs mt-0.5 tracking-widest uppercase">
            #{groupCode}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleReset}
              className="font-body text-xs px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 active:scale-95 transition-all"
            >
              🔄 Reset
            </button>
          )}
          <button
            onClick={onLeave}
            className="font-body text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 active:scale-95 transition-all"
          >
            Leave
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
        {/* My Stats Card */}
        <div
          className="glass-card p-5 animate-slide-up neon-border-amber"
          style={{ animationFillMode: 'both' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: '#f59e0b', boxShadow: '0 0 8px rgba(245,158,11,0.8)' }}
            />
            <span className="font-body text-white/50 text-xs uppercase tracking-widest">
              {username}
            </span>
            <span className="font-body text-white/20 text-xs ml-auto">you</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total', value: myStats.total_count, emoji: '🏆', color: '#e5e7eb' },
              { label: 'Beers', value: myStats.beer_count, emoji: '🍺', color: '#f59e0b' },
              { label: 'Shots', value: myStats.liquor_count, emoji: '🥃', color: '#14b8a6' },
            ].map(({ label, value, emoji, color }) => (
              <div key={label} className="text-center">
                <div className="font-display text-4xl leading-none" style={{ color }}>
                  {value}
                </div>
                <div className="font-body text-white/40 text-xs mt-1">{emoji} {label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Drink Buttons */}
        <div className="relative grid grid-cols-2 gap-3">
          {floats.map(({ id, type }) => (
            <FloatUp key={id} id={id} type={type} />
          ))}

          {/* Beer Button */}
          <button
            className="btn-beer py-8 flex flex-col items-center gap-2"
            style={pressing === 'beer' ? { boxShadow: '0 0 48px rgba(245,158,11,0.7)' } : {}}
            onClick={(e) => handleDrink('beer', e)}
          >
            <span className="text-5xl">🍺</span>
            <span
              className="font-display text-xl tracking-wider"
              style={{ color: '#f59e0b' }}
            >
              BEER
            </span>
          </button>

          {/* Liquor Button */}
          <button
            className="btn-liquor py-8 flex flex-col items-center gap-2"
            style={pressing === 'liquor' ? { boxShadow: '0 0 48px rgba(20,184,166,0.7)' } : {}}
            onClick={(e) => handleDrink('liquor', e)}
          >
            <span className="text-5xl">🥃</span>
            <span
              className="font-display text-xl tracking-wider"
              style={{ color: '#14b8a6' }}
            >
              LIQUOR
            </span>
          </button>
        </div>

        {/* Leaderboard */}
        <div className="glass-card overflow-hidden animate-fade-in">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-display text-xl tracking-wider text-white/80">LEADERBOARD</h2>
            <span className="font-body text-white/30 text-xs">
              {users.length} {users.length === 1 ? 'player' : 'players'}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div
                className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'rgba(245,158,11,0.4)', borderTopColor: 'transparent' }}
              />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10">
              <p className="font-body text-white/30 text-sm">No drinks yet. Get pouring!</p>
            </div>
          ) : (
            <ul>
              {users.map((user, idx) => {
                const isMe = user.username === username
                return (
                  <li
                    key={user.id}
                    className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.04] last:border-0 transition-all duration-300"
                    style={
                      isMe
                        ? { background: 'linear-gradient(90deg, rgba(245,158,11,0.06), transparent)' }
                        : {}
                    }
                  >
                    <RankBadge rank={idx + 1} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-body font-semibold text-sm truncate"
                          style={{ color: isMe ? '#f59e0b' : 'rgba(255,255,255,0.85)' }}
                        >
                          {user.username}
                        </span>
                        {isMe && (
                          <span
                            className="font-body text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}
                          >
                            you
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3 mt-0.5">
                        <span className="font-body text-xs text-white/30">
                          🍺 {user.beer_count}
                        </span>
                        <span className="font-body text-xs text-white/30">
                          🥃 {user.liquor_count}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div
                        className="font-display text-2xl"
                        style={{ color: isMe ? '#f59e0b' : 'rgba(255,255,255,0.7)' }}
                      >
                        {user.total_count}
                      </div>
                      <div className="font-body text-white/25 text-[10px]">drinks</div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
      </div>

      <style>{`
        @keyframes float-up {
          0% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-60px); }
        }
      `}</style>
    </div>
  )
}
