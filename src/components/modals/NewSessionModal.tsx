import { useState } from 'react'
import { supabase } from '../../supabase'
import type { Club } from '../../types'

interface NewSessionModalProps {
  isOpen: boolean
  onClose: () => void
  selectedClub: Club
  onSessionCreated: () => void
  onError: (error: string) => void
}

interface NewSessionFormData {
  title: string
  author: string
  year: string
  due_date: string
}

export default function NewSessionModal({
  isOpen,
  onClose,
  selectedClub,
  onSessionCreated,
  onError
}: NewSessionModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<NewSessionFormData>({
    title: '',
    author: '',
    year: '',
    due_date: ''
  })

  const validateDueDate = (dateString: string): boolean => {
    if (!dateString) return true // Optional field
    const selectedDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Start of today
    return selectedDate > today
  }

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.author.trim()) {
      onError('Title and Author are required')
      return
    }

    if (!formData.due_date) {
      onError('Due date is required')
      return
    }

    if (!validateDueDate(formData.due_date)) {
      onError('Due date must be in the future')
      return
    }

    try {
      setLoading(true)
      onError('') // Clear any existing errors

      const requestBody = {
        club_id: selectedClub.id,
        book: {
          title: formData.title.trim(),
          author: formData.author.trim(),
          year: formData.year.trim() ? parseInt(formData.year.trim()) : undefined
        },
        due_date: formData.due_date
      }

      console.log('Creating new session:', requestBody)

      const { data, error } = await supabase.functions.invoke('session', {
        method: 'POST',
        body: requestBody
      })

      if (error) throw error

      console.log('Session created successfully:', data)

      // Reset form and close modal
      setFormData({ title: '', author: '', year: '', due_date: '' })
      onClose()
      
      // Notify parent component of successful creation
      onSessionCreated()

    } catch (err: unknown) {
      console.error('Error creating session:', err)
      onError(
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Failed to create session'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ title: '', author: '', year: '', due_date: '' })
    onError('') // Clear errors when closing
    onClose()
  }

  // Get tomorrow's date for min date validation
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowString = tomorrow.toISOString().split('T')[0]

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
              <h2 className="text-xl font-bold text-white">Start New Session</h2>
              <p className="text-blue-200/70 text-sm">Begin reading a new book</p>
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
          {/* Book Title Field */}
          <div>
            <label className="block text-white font-medium mb-2">
              Book Title <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., The Lord of the Rings"
              className="w-full bg-white/10 backdrop-blur-md border border-blue-300/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
              disabled={loading}
              maxLength={200}
            />
          </div>

          {/* Author Field */}
          <div>
            <label className="block text-white font-medium mb-2">
              Author <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              placeholder="e.g., J.R.R. Tolkien"
              className="w-full bg-white/10 backdrop-blur-md border border-blue-300/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
              disabled={loading}
              maxLength={100}
            />
          </div>

          {/* Year Field */}
          <div>
            <label className="block text-white font-medium mb-2">
              Publication Year <span className="text-white/50">(optional)</span>
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
              placeholder="e.g., 1954"
              min="1000"
              max={new Date().getFullYear() + 1}
              className="w-full bg-white/10 backdrop-blur-md border border-blue-300/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              disabled={loading}
            />
          </div>

          {/* Due Date Field */}
          <div>
            <label className="block text-white font-medium mb-2">
              Due Date <span className="text-orange-400">*</span>
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              min={tomorrowString}
              className="w-full bg-white/10 backdrop-blur-md border border-blue-300/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
              disabled={loading}
            />
            <p className="text-blue-200/60 text-xs mt-1">
              📅 When should members finish reading this book?
            </p>
          </div>

          {/* Club Context */}
          <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-3">
            <p className="text-blue-200 text-sm font-medium">
              📚 Club: <span className="text-white">{selectedClub.name}</span>
            </p>
            <p className="text-blue-200/60 text-xs mt-1">
              Creating new reading session
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
            disabled={loading || !formData.title.trim() || !formData.author.trim() || !formData.due_date}
            className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-lg disabled:hover:scale-100 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Creating...</span>
              </>
            ) : (
              <span>Start Session</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}