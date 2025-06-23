import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import type { Club, Server } from './types'
import AddClubModal from './components/modals/AddClubModal'
import EditBookModal from './components/modals/EditBookModal'
import NewSessionModal from './components/modals/NewSessionModal'
import ClubsSidebar from './components/ClubsSidebar'

export default function ClubsDashboard() {
  const [servers, setServers] = useState<Server[]>([])
  const [selectedServer, setSelectedServer] = useState<string>('')
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Add Club Modal State
  const [showAddClubModal, setShowAddClubModal] = useState(false)
  
  // Edit Book Modal State
  const [showEditBookModal, setShowEditBookModal] = useState(false)
  
  // New Session Modal State
  const [showNewSessionModal, setShowNewSessionModal] = useState(false)
  
  // Delete Club Modal State
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [clubToDelete, setClubToDelete] = useState<{ id: string; name: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch servers on component mount
  useEffect(() => {
    fetchServers(false) // Don't preserve selection on initial load
  }, [])

  const fetchServers = async (preserveSelection = true) => {
    try {
      setLoading(true)
      setError(null)
      
      // Preserve current selection if requested
      const currentSelection = preserveSelection ? selectedServer : null
      
      const { data, error } = await supabase.functions.invoke('server', {
        method: 'GET'
      })

      if (error) throw error

      if (data?.servers) {
        setServers(data.servers)
        
        // Smart selection logic
        if (currentSelection && data.servers.find((s: Server) => s.id === currentSelection)) {
          // Preserve selection if the server still exists
          setSelectedServer(currentSelection)
        } else if (data.servers.length > 0) {
          // Fallback to first server if current selection doesn't exist or no preservation requested
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

  const handleDeleteClub = async () => {
    if (!clubToDelete) return

    try {
      setDeleteLoading(true)
      setError(null)

      console.log('Deleting club:', clubToDelete)

      const { data, error } = await supabase.functions.invoke(`club?id=${encodeURIComponent(clubToDelete.id)}&server_id=${encodeURIComponent(selectedServer)}`, {
        method: 'DELETE'
      })

      if (error) throw error

      console.log('Club deleted successfully:', data)

      // Clear selected club if it was the one being deleted
      if (selectedClub?.id === clubToDelete.id) {
        setSelectedClub(null)
      }

      // Refresh servers to get updated club list
      await fetchServers() // Will preserve server selection

      // Close modal and reset state
      setShowDeleteConfirmModal(false)
      setClubToDelete(null)

    } catch (err: unknown) {
      console.error('Error deleting club:', err)
      setError(
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Failed to delete club'
      )
    } finally {
      setDeleteLoading(false)
    }
  }

  const confirmDeleteClub = (club: { id: string; name: string }) => {
    setClubToDelete(club)
    setShowDeleteConfirmModal(true)
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
          {/* Clubs Sidebar */}
          <ClubsSidebar
            selectedServerData={selectedServerData}
            selectedClub={selectedClub}
            onClubSelect={fetchClubDetails}
            onAddClub={() => setShowAddClubModal(true)}
            onDeleteClub={confirmDeleteClub}
          />

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
                            <button 
                              onClick={() => setShowEditBookModal(true)}
                              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-blue-400/30"
                            >
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
                      <button className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-lg"
                        onClick={() => setShowNewSessionModal(true)}
                      >
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

        <AddClubModal
          isOpen={showAddClubModal}
          onClose={() => setShowAddClubModal(false)}
          selectedServer={selectedServer}
          selectedServerData={selectedServerData}
          onClubCreated={async (clubId) => {
            await fetchServers() // Will preserve selection by default
            await fetchClubDetails(clubId) // Auto-select the new club
          }}
          onError={setError}
        />

        {/* Edit Book Modal */}
        {selectedClub && (
          <EditBookModal
            isOpen={showEditBookModal}
            onClose={() => setShowEditBookModal(false)}
            selectedClub={selectedClub}
            onBookUpdated={async () => {
              await fetchClubDetails(selectedClub.id) // Refresh club details to show updated book
            }}
            onError={setError}
          />
        )}

        {/* New Session Modal */}
        {selectedClub && (
          <NewSessionModal
            isOpen={showNewSessionModal}
            onClose={() => setShowNewSessionModal(false)}
            selectedClub={selectedClub}
            onSessionCreated={async () => {
              await fetchClubDetails(selectedClub.id) // Refresh club details to show new session
            }}
            onError={setError}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmModal && clubToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800 via-red-900/20 to-slate-800 rounded-2xl border border-red-300/30 p-6 w-full max-w-md shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">⚠️</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Delete Club</h2>
                  <p className="text-red-200/70 text-sm">This action cannot be undone</p>
                </div>
              </div>

              {/* Warning Content */}
              <div className="mb-6">
                <p className="text-white mb-3">
                  Are you sure you want to delete <span className="font-bold text-orange-300">"{clubToDelete.name}"</span>?
                </p>
                <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-4">
                  <p className="text-red-200 text-sm font-medium mb-2">⚠️ This will permanently delete:</p>
                  <ul className="text-red-200/80 text-sm space-y-1 ml-4">
                    <li>• All reading sessions and books</li>
                    <li>• All discussions and events</li>
                    <li>• All member associations</li>
                    <li>• The entire club history</li>
                  </ul>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowDeleteConfirmModal(false)
                    setClubToDelete(null)
                  }}
                  className="text-white/60 hover:text-white transition-colors font-medium"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleDeleteClub}
                  disabled={deleteLoading}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-lg disabled:hover:scale-100 flex items-center space-x-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete Club</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}