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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-transparent mx-auto shadow-lg"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-orange-400 border-r-transparent animate-spin-slow"></div>
          </div>
          <p className="mt-6 text-white/90 text-lg font-medium">Loading your book clubs...</p>
          <div className="mt-2 text-blue-200 text-sm">📚 Organizing your library</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-blue-900">
      {/* Header with Material Design elevation */}
      <header className="bg-white/5 backdrop-blur-md border-b border-blue-300/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-lg">📖</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-orange-200 bg-clip-text text-transparent">
                  Book Club Central
                </h1>
                <p className="text-blue-200/70 text-xs font-medium">Admin Dashboard</p>
              </div>
            </div>
            
            {/* Material Design Server Selector */}
            {servers.length > 0 && (
              <select 
                value={selectedServer} 
                onChange={(e) => {
                  setSelectedServer(e.target.value)
                  setSelectedClub(null)
                }}
                className="bg-white/10 backdrop-blur-md border border-blue-300/30 rounded-xl px-4 py-2.5 pr-8 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl p-4 shadow-lg">
            <div className="flex items-center">
              <span className="text-red-300 mr-2">⚠️</span>
              <p className="text-red-100 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Material Design Sidebar - Book Spine Style */}
          <div className="lg:col-span-1">
            <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-blue-300/20 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-blue-300/20 bg-gradient-to-r from-blue-600/20 to-orange-600/20">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center">
                      <span className="mr-2">📚</span>
                      Book Clubs
                    </h2>
                    <p className="text-blue-200/70 text-sm">{selectedServerData?.clubs.length || 0} active clubs</p>
                  </div>
                  <button 
                    onClick={() => alert('TODO: Add new club functionality')}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 shadow-md"
                  >
                    + Add Club
                  </button>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {selectedServerData?.clubs.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-3">📖</div>
                    <p className="text-white/60 font-medium">No clubs found</p>
                    <p className="text-blue-200/50 text-sm mt-1">Create your first book club!</p>
                  </div>
                ) : (
                  selectedServerData?.clubs.map((club, index) => (
                    <div 
                      key={club.id}
                      onClick={() => fetchClubDetails(club.id)}
                      className={`p-4 cursor-pointer transition-all duration-300 border-b border-white/5 last:border-b-0 hover:bg-white/8 group ${
                        selectedClub?.id === club.id ? 'bg-blue-500/20 border-r-4 border-orange-400 shadow-lg' : ''
                      }`}
                      style={{
                        background: selectedClub?.id === club.id 
                          ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)'
                          : undefined
                      }}
                    >
                      {/* Book Spine Design */}
                      <div className="flex items-start space-x-3">
                        <div className={`w-1 h-12 rounded-full bg-gradient-to-b transition-all duration-200 ${
                          selectedClub?.id === club.id 
                            ? 'from-orange-400 to-blue-500' 
                            : 'from-blue-400 to-blue-600 group-hover:from-orange-400 group-hover:to-blue-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white group-hover:text-blue-200 transition-colors truncate">
                            {club.name}
                          </h3>
                          {club.discord_channel && (
                            <p className="text-sm text-blue-300/80 mt-1">#{club.discord_channel}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-sm text-white/60">Active club</p>
                            <div className={`h-2 w-2 rounded-full transition-all duration-200 ${
                              selectedClub?.id === club.id ? 'bg-orange-400 animate-pulse' : 'bg-blue-400'
                            }`}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedClub ? (
              <div className="space-y-6">
                {/* Hero Current Reading Card */}
                {selectedClub.active_session ? (
                  <div className="bg-gradient-to-r from-orange-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl border border-orange-300/30 p-8 shadow-2xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-blue-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                              <span className="text-white font-bold text-xl">📖</span>
                            </div>
                            <div>
                              <h2 className="text-3xl font-black text-white leading-tight">
                                Currently Reading
                              </h2>
                              <p className="text-orange-200/80 font-medium">Active Session</p>
                            </div>
                          </div>
                          
                          {/* Action Buttons Area - Top Right */}
                          <div className="hidden md:flex space-x-3">
                            <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-blue-400/30">
                              Edit Book
                            </button>
                            <button className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-orange-400/30">
                              New Session
                            </button>
                          </div>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 pr-6">
                              <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                                {selectedClub.active_session.book.title}
                              </h3>
                              <p className="text-xl text-orange-200 mb-3 font-semibold">
                                by {selectedClub.active_session.book.author}
                              </p>
                              
                              {selectedClub.active_session.book.edition && (
                                <p className="text-blue-200/80 mb-3 font-medium">
                                  📕 {selectedClub.active_session.book.edition} Edition
                                </p>
                              )}
                              
                              {selectedClub.active_session.due_date && (
                                <div className="flex items-center bg-orange-500/20 rounded-lg px-4 py-3 border border-orange-400/30">
                                  <span className="text-2xl mr-3">⏰</span>
                                  <div>
                                    <p className="text-white font-bold">Due Date</p>
                                    <p className="text-orange-200 text-lg font-semibold">
                                      {new Date(selectedClub.active_session.due_date).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Book Cover Placeholder - Right side of book info */}
                            <div className="hidden md:block">
                              <div className="w-32 h-44 bg-gradient-to-b from-orange-400 to-blue-500 rounded-lg shadow-2xl flex items-center justify-center border-4 border-white/20">
                                <div className="text-center text-white">
                                  <div className="text-3xl mb-2">📚</div>
                                  <div className="text-xs font-bold">BOOK</div>
                                  <div className="text-xs">COVER</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-blue-300/20 p-8 text-center shadow-xl">
                    <div className="max-w-md mx-auto">
                      <div className="h-20 w-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">📖</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">No Active Reading</h3>
                      <p className="text-white/60 mb-6">This club doesn't have an active reading session. Start one to get the conversation going!</p>
                      <button className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-lg">
                        + Start New Session
                      </button>
                    </div>
                  </div>
                )}

                {/* Club Info & Stats */}
                <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-blue-300/20 p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedClub.name}</h2>
                      {selectedClub.discord_channel && (
                        <p className="text-blue-200 mt-1 font-medium">Discord: #{selectedClub.discord_channel}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-sm font-medium">Server ID</p>
                      <p className="text-white font-mono text-sm bg-blue-500/20 px-2 py-1 rounded">{selectedClub.server_id}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Discussions */}
                  {selectedClub.active_session?.discussions && selectedClub.active_session.discussions.length > 0 && (
                    <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-blue-300/20 p-6 shadow-xl">
                      <h3 className="font-bold text-white mb-4 flex items-center">
                        <span className="mr-3 text-xl">💬</span>
                        Upcoming Discussions
                      </h3>
                      <div className="space-y-3">
                        {selectedClub.active_session.discussions.map(discussion => (
                          <div key={discussion.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors">
                            <h4 className="font-bold text-white mb-2">{discussion.title}</h4>
                            <div className="flex items-center text-sm text-white/70 space-x-4">
                              <span className="flex items-center">
                                <span className="mr-1">📅</span>
                                {new Date(discussion.date).toLocaleDateString()}
                              </span>
                              {discussion.location && (
                                <span className="flex items-center">
                                  <span className="mr-1">📍</span>
                                  {discussion.location}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Material Design Members Table */}
                <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-blue-300/20 overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-blue-300/20 bg-gradient-to-r from-blue-600/10 to-orange-600/10">
                    <h3 className="font-bold text-white flex items-center text-xl">
                      <span className="mr-3 text-2xl">👥</span>
                      Club Members ({selectedClub.members.length})
                    </h3>
                    <p className="text-blue-200/70 text-sm mt-1">Reading community overview</p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-blue-300/20 bg-blue-500/5">
                          <th className="text-left py-4 px-6 text-blue-200 font-bold">Reader</th>
                          <th className="text-left py-4 px-6 text-blue-200 font-bold">Points</th>
                          <th className="text-left py-4 px-6 text-blue-200 font-bold">Books Read</th>
                          <th className="text-left py-4 px-6 text-blue-200 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedClub.members.map(member => (
                          <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-200 group">
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:scale-110 transition-transform duration-200">
                                  <span className="text-white text-sm font-bold">
                                    {member.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-white font-semibold">{member.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="bg-blue-500/20 text-blue-200 px-3 py-1.5 rounded-full text-sm font-bold border border-blue-400/30">
                                {member.points} pts
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <span className="text-white/90 font-medium mr-2">{member.books_read}</span>
                                <span className="text-orange-300">📚</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              {selectedClub.shame_list.includes(member.id) ? (
                                <span className="bg-red-500/20 text-red-300 px-3 py-1.5 rounded-full text-xs font-bold border border-red-400/30 flex items-center w-fit">
                                  <span className="mr-1">😰</span>
                                  Shame List
                                </span>
                              ) : (
                                <span className="bg-green-500/20 text-green-300 px-3 py-1.5 rounded-full text-xs font-bold border border-green-400/30 flex items-center w-fit">
                                  <span className="mr-1">✨</span>
                                  Good Standing
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
              <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-blue-300/20 p-12 text-center shadow-xl">
                <div className="max-w-md mx-auto">
                  <div className="h-20 w-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">📚</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Select a Book Club</h3>
                  <p className="text-white/60 leading-relaxed">Choose a club from the sidebar to explore its members, current reading session, and upcoming discussions.</p>
                  <div className="mt-6 text-blue-200/50 text-sm">
                    📖 Ready to dive into some great literature?
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}