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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your book clubs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Book Club Admin</h1>
            
            {/* Server Selector */}
            {servers.length > 0 && (
              <select 
                value={selectedServer} 
                onChange={(e) => {
                  setSelectedServer(e.target.value)
                  setSelectedClub(null)
                }}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                {servers.map(server => (
                  <option key={server.id} value={server.id}>
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
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clubs List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Clubs</h2>
                  <button 
                    onClick={() => alert('TODO: Add new club functionality')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                  >
                    Add Club
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {selectedServerData?.clubs.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No clubs found for this server.
                  </div>
                ) : (
                  selectedServerData?.clubs.map(club => (
                    <div 
                      key={club.id}
                      onClick={() => fetchClubDetails(club.id)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedClub?.id === club.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <h3 className="font-medium text-gray-900">{club.name}</h3>
                      {club.discord_channel && (
                        <p className="text-sm text-gray-500">#{club.discord_channel}</p>
                      )}
                      <p className="text-sm text-gray-400">{club.members?.length || 0} members</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Club Details */}
          <div className="lg:col-span-2">
            {selectedClub ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">{selectedClub.name}</h2>
                  {selectedClub.discord_channel && (
                    <p className="text-gray-600">Discord: #{selectedClub.discord_channel}</p>
                  )}
                </div>

                <div className="p-6 space-y-6">
                  {/* Active Session */}
                  {selectedClub.active_session ? (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Current Reading</h3>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-900">
                          {selectedClub.active_session.book.title}
                        </h4>
                        <p className="text-green-700">by {selectedClub.active_session.book.author}</p>
                        {selectedClub.active_session.due_date && (
                          <p className="text-sm text-green-600 mt-2">
                            Due: {new Date(selectedClub.active_session.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Current Reading</h3>
                      <p className="text-gray-500 italic">No active session</p>
                    </div>
                  )}

                  {/* Members */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Members ({selectedClub.members.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedClub.members.map(member => (
                        <div key={member.id} className="border border-gray-200 rounded-lg p-3">
                          <h4 className="font-medium text-gray-900">{member.name}</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Points: {member.points}</p>
                            <p>Books Read: {member.books_read}</p>
                          </div>
                          {selectedClub.shame_list.includes(member.id) && (
                            <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                              Shame List
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Discussions */}
                  {selectedClub.active_session?.discussions && selectedClub.active_session.discussions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Upcoming Discussions</h3>
                      <div className="space-y-2">
                        {selectedClub.active_session.discussions.map(discussion => (
                          <div key={discussion.id} className="border border-gray-200 rounded-lg p-3">
                            <h4 className="font-medium text-gray-900">{discussion.title}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(discussion.date).toLocaleDateString()}
                              {discussion.location && ` • ${discussion.location}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">Select a club to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}