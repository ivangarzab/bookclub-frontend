import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import type { Club, Server } from './types'

export default function ClubsDashboard() {
  const [servers, setServers] = useState<Server[]>([])
  const [selectedServer, setSelectedServer] = useState<string>('')
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch servers on component mount
  useEffect(() => {
    fetchServers()
  }, [])

  const fetchServers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase.functions.invoke('server', {
        method: 'GET'
      })

      if (error) throw error

      if (data?.servers) {
        setServers(data.servers)
        if (data.servers.length > 0) {
          setSelectedServer(data.servers[0].id)
        }
      }
    } catch (err: unknown) {
      console.error('Error fetching servers:', err)
      setError(
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Failed to fetch servers'
      )
    } finally {
      setLoading(false)
    }
  }

  const fetchClubDetails = async (clubId: string) => {
    try {
      setError(null)
      
      // Build URL with query parameters since Edge Function expects GET with query params
      const functionName = `club?id=${encodeURIComponent(clubId)}&server_id=${encodeURIComponent(selectedServer)}`
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        method: 'GET'
      })

      if (error) throw error
      
      setSelectedClub(data)
    } catch (err: unknown) {
      console.error('Error fetching club details:', err)
      setError(
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Failed to fetch club details'
      )
    }
  }

  const selectedServerData = servers.find(s => s.id === selectedServer)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-400 border-r-transparent animate-spin-slow"></div>
          </div>
          <p className="mt-6 text-white/80 text-lg font-medium">Loading your book clubs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-500">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">📚</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                Book Club Admin
              </h1>
            </div>
            
            {/* Server Selector */}
            {servers.length > 0 && (
              <select 
                value={selectedServer} 
                onChange={(e) => {
                  setSelectedServer(e.target.value)
                  setSelectedClub(null)
                }}
                className="bg-white/10 backdrop-blur-md border border-white/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              >
                {servers.map(server => (
                  <option key={server.id} value={server.id} className="bg-slate-800 text-white">
                    {server.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-4">
            <p className="text-red-100">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Clubs Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">Clubs</h2>
                  <button 
                    onClick={() => alert('TODO: Add new club functionality')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    + Add
                  </button>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {selectedServerData?.clubs.length === 0 ? (
                  <div className="p-6 text-center text-white/60">
                    No clubs found for this server.
                  </div>
                ) : (
                  selectedServerData?.clubs.map(club => (
                    <div 
                      key={club.id}
                      onClick={() => fetchClubDetails(club.id)}
                      className={`p-4 cursor-pointer transition-all duration-200 hover:bg-white/10 border-b border-white/10 last:border-b-0 ${
                        selectedClub?.id === club.id ? 'bg-purple-500/20 border-r-4 border-purple-400' : ''
                      }`}
                    >
                      <h3 className="font-medium text-white">{club.name}</h3>
                      {club.discord_channel && (
                        <p className="text-sm text-purple-200">#{club.discord_channel}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-white/60">{club.members?.length || 0} members</p>
                        <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedClub ? (
              <div className="space-y-6">
                {/* Club Header */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedClub.name}</h2>
                      {selectedClub.discord_channel && (
                        <p className="text-purple-200 mt-1">Discord: #{selectedClub.discord_channel}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-sm">Server ID</p>
                      <p className="text-white font-mono text-sm">{selectedClub.server_id}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Current Reading */}
                  <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                    <h3 className="font-semibold text-white mb-4 flex items-center">
                      <span className="mr-2">📖</span>
                      Current Reading
                    </h3>
                    {selectedClub.active_session ? (
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
                        <h4 className="font-medium text-green-100 text-lg">
                          {selectedClub.active_session.book.title}
                        </h4>
                        <p className="text-green-200">by {selectedClub.active_session.book.author}</p>
                        {selectedClub.active_session.book.edition && (
                          <p className="text-green-200/80 text-sm">Edition: {selectedClub.active_session.book.edition}</p>
                        )}
                        {selectedClub.active_session.due_date && (
                          <div className="mt-3 flex items-center text-sm">
                            <span className="mr-2">⏰</span>
                            <span className="text-green-200">
                              Due: {new Date(selectedClub.active_session.due_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-white/60 italic">No active reading session</p>
                        <button className="mt-2 text-purple-300 hover:text-purple-200 text-sm">
                          + Start a new session
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Discussions */}
                  {selectedClub.active_session?.discussions && selectedClub.active_session.discussions.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                      <h3 className="font-semibold text-white mb-4 flex items-center">
                        <span className="mr-2">💬</span>
                        Upcoming Discussions
                      </h3>
                      <div className="space-y-3">
                        {selectedClub.active_session.discussions.map(discussion => (
                          <div key={discussion.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                            <h4 className="font-medium text-white">{discussion.title}</h4>
                            <div className="flex items-center mt-2 text-sm text-white/70">
                              <span className="mr-4">📅 {new Date(discussion.date).toLocaleDateString()}</span>
                              {discussion.location && (
                                <span>📍 {discussion.location}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Members Table */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
                  <div className="p-6 border-b border-white/20">
                    <h3 className="font-semibold text-white flex items-center">
                      <span className="mr-2">👥</span>
                      Members ({selectedClub.members.length})
                    </h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left py-3 px-6 text-white/80 font-medium">Name</th>
                          <th className="text-left py-3 px-6 text-white/80 font-medium">Points</th>
                          <th className="text-left py-3 px-6 text-white/80 font-medium">Books Read</th>
                          <th className="text-left py-3 px-6 text-white/80 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedClub.members.map(member => (
                          <tr key={member.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className="h-8 w-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-white text-sm font-medium">
                                    {member.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-white font-medium">{member.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="bg-purple-500/20 text-purple-200 px-2 py-1 rounded-full text-sm font-medium">
                                {member.points}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-white/80">{member.books_read}</span>
                            </td>
                            <td className="py-4 px-6">
                              {selectedClub.shame_list.includes(member.id) ? (
                                <span className="bg-red-500/20 text-red-200 px-2 py-1 rounded-full text-xs font-medium">
                                  😱 Shame List
                                </span>
                              ) : (
                                <span className="bg-green-500/20 text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                                  ✅ Good Standing
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="h-16 w-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Select a Club</h3>
                  <p className="text-white/60">Choose a club from the sidebar to view its details, members, and current reading session.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}