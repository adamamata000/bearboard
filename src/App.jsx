import { useState, useEffect } from 'react'
import JoinScreen from './components/JoinScreen'
import LeaderboardScreen from './components/LeaderboardScreen'

export default function App() {
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const username = localStorage.getItem('bb_username')
    const groupCode = localStorage.getItem('bb_group_code')
    if (username && groupCode) {
      setSession({ username, groupCode })
    }
    setChecking(false)
  }, [])

  const handleJoin = (username, groupCode) => {
    setSession({ username, groupCode })
  }

  const handleLeave = () => {
    localStorage.removeItem('bb_username')
    localStorage.removeItem('bb_group_code')
    setSession(null)
  }

  if (checking) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: 'rgba(245,158,11,0.3)', borderTopColor: '#f59e0b' }}
        />
      </div>
    )
  }

  if (!session) {
    return <JoinScreen onJoin={handleJoin} />
  }

  return (
    <LeaderboardScreen
      username={session.username}
      groupCode={session.groupCode}
      onLeave={handleLeave}
    />
  )
}
