import { useState } from 'react'
import { supabase } from '../../supabase'
import type { Club } from '../../types'

interface AddDiscussionModalProps {
  isOpen: boolean
  onClose: () => void
  selectedClub: Club
  onDiscussionCreated: () => void
  onError: (error: string) => void
}

interface AddDiscussionFormData {
  title: string
  date: string
  location: string
}

export default function AddDiscussionModal({
  isOpen,
  onClose,
  selectedClub,
  onDiscussionCreated,
  onError
}: AddDiscussionModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<AddDiscussionFormData>({
    title: '',
    date: '',
    location: ''
  })

  const validateDate = (dateString: string): boolean => {
    if (!dateString) return false
    const selectedDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Start of today
    return selectedDate >= today
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      onError('Discussion title is required')
      return
    }

    if (!formData.date) {
      onError('Discussion date is required')
      return
    }

    if (!validateDate(formData.date)) {
      onError('Discussion date must be today or in the future')
      return
    }

    if (!selectedClub.active_session) {
      onError('No active session found')
      return
    }

    try {
      setLoading(true)
      onError('') // Clear any existing errors

      // Create new discussion object
      const newDiscussion = {
        id: crypto.randomUUID(),
        title: formData.title.trim(),
        date: formData.date,
        location: formData.location.trim() || undefined
      }

      // Get existing discussions and add the new one
      const existingDiscussions = selectedClub.active_session.discussions || []
      const updatedDiscussions = [...existingDiscussions, newDiscussion]

      const requestBody = {
        id: selectedClub.active_session.id,
        discussions: updatedDiscussions
      }

      console.log('Adding discussion to session:', requestBody)

      const { data, error } = await supabase.functions.invoke('session', {
        method: 'PUT',
        body: requestBody
      })

      if (error) throw error

      console.log('Discussion added successfully:', data)

      // Reset form and close modal
      setFormData({ title: '', date: '', location: '' })
      onClose()
      
      // Notify parent component of successful creation
      onDiscussionCreated()

    } catch (err: unknown) {
      console.error('Error adding discussion:', err)
      onError(
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Failed to add discussion'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ title: '', date: '', location: '' })
    onError('') // Clear errors when closing
    onClose()
  }

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0]

  if (!isOpen || !selectedClub.active_session) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 via-blue-900 to-slate-800 rounded-2xl border border-blue-300/30 p-6 w-full max-w-md shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">💬</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Add Discussion</h2>
              <p className="text-blue-200/70 text-sm">Schedule a new discussion event</p>
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
          {/* Discussion Title Field */}
          <div>
            <label className="block text-white font-medium mb-2">
              Discussion Title <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Chapter 1-5 Discussion"
              className="w-full bg-white/10 backdrop-blur-md border border-blue-300/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
              disabled={loading}
              maxLength={200}
            />
          </div>

          {/* Discussion Date Field */}
          <div>
            <label className="block text-white font-medium mb-2">
              Discussion Date <span className="text-orange-400">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              min={today}
              className="w-full bg-white/10 backdrop-blur-md border border-blue-300/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
              disabled={loading}
            />
            <p className="text-blue-200/60 text-xs mt-1">
              📅 When will this discussion take place?
            </p>
          </div>

          {/* Location Field */}
          <div>
            <label className="block text-white font-medium mb-2">
              Location <span className="text-white/50">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Community Center, Discord Voice Chat"
              className="w-full bg-white/10 backdrop-blur-md border border-blue-300/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              disabled={loading}
              maxLength={100}
            />
            <p className="text-blue-200/60 text-xs mt-1">
              📍 Where will the discussion happen?
            </p>
          </div>

          {/* Session Context */}
          <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-3">
            <p className="text-blue-200 text-sm font-medium">
              📚 Book: <span className="text-white">{selectedClub.active_session.book.title}</span>
            </p>
            <p className="text-blue-200/60 text-xs mt-1">
              Adding to current reading session
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
            disabled={loading || !formData.title.trim() || !formData.date}
            className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-lg disabled:hover:scale-100 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Adding...</span>
              </>
            ) : (
              <span>Add Discussion</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}