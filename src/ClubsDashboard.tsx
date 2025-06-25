import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import type { Club, Server } from './types'
import AddClubModal from './components/modals/AddClubModal'
import EditBookModal from './components/modals/EditBookModal'
import NewSessionModal from './components/modals/NewSessionModal'
import DiscussionModal from './components/modals/DiscussionModal'
import MemberModal from './components/modals/MemberModal'
import DeleteMemberModal from './components/modals/DeleteMemberModal'
import DeleteDiscussionModal from './components/modals/DeleteDiscussionModal'
import DeleteClubModal from './components/modals/DeleteClubModal'
import ClubsSidebar from './components/ClubsSidebar'
import CurrentReadingCard from './components/CurrentReadingCard'
import DiscussionsTimeline from './components/DiscussionsTimeline'
import MembersTable from './components/MembersTable'

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
  
  // Discussion Modal State
  const [showAddDiscussionModal, setShowAddDiscussionModal] = useState(false)
  const [editingDiscussion, setEditingDiscussion] = useState<any>(null)
  
  // Delete Discussion Modal State
  const [showDeleteDiscussionModal, setShowDeleteDiscussionModal] = useState(false)
  const [discussionToDelete, setDiscussionToDelete] = useState<any>(null)
  
  // Delete Club Modal State
  const [showDeleteClubModal, setShowDeleteClubModal] = useState(false)
  const [clubToDelete, setClubToDelete] = useState<{ id: string; name: string } | null>(null)

  // Member Modal State
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [editingMember, setEditingMember] = useState<any>(null)

  // Delete Member Modal State
  const [showDeleteMemberModal, setShowDeleteMemberModal] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<any>(null)

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

  // Club handlers
  const confirmDeleteClub = (club: { id: string; name: string }) => {
    setClubToDelete(club)
    setShowDeleteClubModal(true)
  }

  // Discussion handlers
  const handleAddDiscussion = () => {
    setEditingDiscussion(null) // Clear any editing discussion
    setShowAddDiscussionModal(true)
  }

  const handleEditDiscussion = (discussion: any) => {
    setEditingDiscussion(discussion)
    setShowAddDiscussionModal(true)
  }

  const handleDeleteDiscussion = (discussion: any) => {
    setDiscussionToDelete(discussion)
    setShowDeleteDiscussionModal(true)
  }

  // Member handlers
  const handleAddMember = () => {
    setEditingMember(null) // Clear any editing member
    setShowMemberModal(true)
  }

  const handleEditMember = (member: any) => {
    setEditingMember(member)
    setShowMemberModal(true)
  }

  const handleDeleteMember = (member: any) => {
    setMemberToDelete(member)
    setShowDeleteMemberModal(true)
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
                
                {/* Hero Current Reading Card */}
                <CurrentReadingCard
                  selectedClub={selectedClub}
                  onEditBook={() => setShowEditBookModal(true)}
                  onNewSession={() => setShowNewSessionModal(true)}
                />

                {/* Discussions Timeline */}
                <DiscussionsTimeline
                  selectedClub={selectedClub}
                  onAddDiscussion={handleAddDiscussion}
                  onEditDiscussion={handleEditDiscussion}
                  onDeleteDiscussion={handleDeleteDiscussion}
                />

                {/* Material Design Members Table */}
                <MembersTable 
                  selectedClub={selectedClub}
                  onAddMember={handleAddMember}
                  onEditMember={handleEditMember}
                  onDeleteMember={handleDeleteMember}
                />
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

      {/* All Modals - Clean and Organized! */}
      
      {/* Add Club Modal */}
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

      {/* Add/Edit Discussion Modal */}
      {selectedClub && (
        <DiscussionModal
          isOpen={showAddDiscussionModal}
          onClose={() => {
            setShowAddDiscussionModal(false)
            setEditingDiscussion(null)
          }}
          selectedClub={selectedClub}
          editingDiscussion={editingDiscussion}
          onDiscussionSaved={async () => {
            await fetchClubDetails(selectedClub.id) // Refresh club details to show updated discussions
          }}
          onError={setError}
        />
      )}

      {/* Add/Edit Member Modal */}
      {selectedClub && (
        <MemberModal
          isOpen={showMemberModal}
          onClose={() => {
            setShowMemberModal(false)
            setEditingMember(null)
          }}
          selectedClub={selectedClub}
          selectedServerData={selectedServerData}
          editingMember={editingMember}
          onMemberSaved={async () => {
            await fetchClubDetails(selectedClub.id) // Refresh club details to show updated members
          }}
          onError={setError}
        />
      )}

      {/* Delete Member Modal */}
      {selectedClub && (
        <DeleteMemberModal
          isOpen={showDeleteMemberModal}
          onClose={() => {
            setShowDeleteMemberModal(false)
            setMemberToDelete(null)
          }}
          memberToDelete={memberToDelete}
          onMemberDeleted={async () => {
            await fetchClubDetails(selectedClub.id) // Refresh club details to show updated members
          }}
          onError={setError}
        />
      )}

      {/* Delete Discussion Modal */}
      {selectedClub && (
        <DeleteDiscussionModal
          isOpen={showDeleteDiscussionModal}
          onClose={() => {
            setShowDeleteDiscussionModal(false)
            setDiscussionToDelete(null)
          }}
          discussionToDelete={discussionToDelete}
          selectedClub={selectedClub}
          onDiscussionDeleted={async () => {
            await fetchClubDetails(selectedClub.id) // Refresh club details to show updated discussions
          }}
          onError={setError}
        />
      )}

      {/* Delete Club Modal */}
      <DeleteClubModal
        isOpen={showDeleteClubModal}
        onClose={() => {
          setShowDeleteClubModal(false)
          setClubToDelete(null)
        }}
        clubToDelete={clubToDelete}
        selectedServer={selectedServer}
        selectedClub={selectedClub}
        onClubDeleted={async () => {
          // Clear selected club if it was the one being deleted
          if (selectedClub?.id === clubToDelete?.id) {
            setSelectedClub(null)
          }
          // Refresh servers to get updated club list
          await fetchServers() // Will preserve server selection
        }}
        onError={setError}
      />
    </div>
  )
}