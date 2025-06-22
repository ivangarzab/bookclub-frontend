import { useState } from 'react'
import { supabase } from '../../supabase'
import type { Server } from '../../types'

interface AddClubModalProps {
  isOpen: boolean
  onClose: () => void
  selectedServer: string
  selectedServerData: Server | undefined
  onClubCreated: (clubId: string) => void
  onError: (error: string) => void
}

interface AddClubFormData {
  name: string
  discord_channel: string
}

export default function AddClubModal({
  isOpen,
  onClose,
  selectedServer,
  selectedServerData,
  onClubCreated,
  onError
}: AddClubModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<AddClubFormData>({
    name: '',
    discord_channel: ''
  })

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      onError('Club name is required')
      return
    }

    try {
      setLoading(true)
      onError('') // Clear any existing errors

      // Generate UUID for the club
      const clubId = crypto.randomUUID()

      // Prepare the request body
      const requestBody = {
        id: clubId,
        name: formData.name.trim(),
        server_id: selectedServer,
        discord_channel: formData.discord_channel.trim() || null
      }

      console.log('Creating club:', requestBody)

      const { data, error } = await supabase.functions.invoke('club', {
        method: 'POST',
        body: requestBody
      })

      if (error) throw error

      console.log('Club created successfully:', data)

      // Reset form and close modal
      setFormData({ name: '', discord_channel: '' })
      onClose()
      
      // Notify parent component of successful creation
      onClubCreated(clubId)

    } catch (err: unknown) {
      console.error('Error creating club:', err)
      onError(
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Failed to create club'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ name: '', discord_channel: '' })
    onError('') // Clear errors when closing
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 via-blue-900 to-slate-800 rounded-2xl border border-blue-300/30 p-6 w-full max-w-md shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-orange-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">📚</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Add New Club</h2>
              <p className="text-blue-200/70 text-sm">Create a book club for your server</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors p-1"
            disabled={loading}
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* Modal Form */}
        <div className="space-y-4">
          {/* Club Name Field */}
          <div>
            <label className="block text-white font-medium mb-2">
              Club Name <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Fantasy Book Club"
              className="w-full bg-white/10 backdrop-blur-md border border-blue-300/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
              disabled={loading}
              maxLength={100}
            />
          </div>

          {/* Discord Channel ID Field */}
          <div>
            <label className="block text-white font-medium mb-2">
              Discord Channel ID <span className="text-white/50">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.discord_channel}
              onChange={(e) => setFormData(prev => ({ ...prev, discord_channel: e.target.value }))}
              placeholder="123456789012345678"
              className="w-full bg-white/10 backdrop-blur-md border border-blue-300/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              disabled={loading}
            />
            <p className="text-blue-200/60 text-xs mt-1">
              💡 Right-click a Discord channel → Copy ID (requires Developer Mode)
            </p>
          </div>

          {/* Server Info */}
          <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-3">
            <p className="text-blue-200 text-sm font-medium">
              📡 Server: <span className="text-white">{selectedServerData?.name}</span>
            </p>
            <p className="text-blue-200/60 text-xs mt-1">
              Club will be created in this server
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim()}
            className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-lg disabled:hover:scale-100 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Creating...</span>
              </>
            ) : (
              <span>Create Club</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}