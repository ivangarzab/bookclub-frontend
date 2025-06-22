import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'
import type { Club } from '../../types'

interface EditBookModalProps {
  isOpen: boolean
  onClose: () => void
  selectedClub: Club
  onBookUpdated: () => void
  onError: (error: string) => void
}

interface EditBookFormData {
  title: string
  author: string
  edition: string
  year: string
  due_date: string
}

export default function EditBookModal({
  isOpen,
  onClose,
  selectedClub,
  onBookUpdated,
  onError
}: EditBookModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<EditBookFormData>({
    title: '',
    author: '',
    edition: '',
    year: '',
    due_date: ''
  })

  // Pre-populate form when modal opens
  useEffect(() => {
    if (isOpen && selectedClub.active_session) {
      const book = selectedClub.active_session.book
      const session = selectedClub.active_session
      
      setFormData({
        title: book.title || '',
        author: book.author || '',
        edition: book.edition || '',
        year: book.year ? String(book.year) : '',
        due_date: session.due_date ? session.due_date.split('T')[0] : '' // Convert to YYYY-MM-DD format
      })
    }
  }, [isOpen, selectedClub])

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.author.trim()) {
      onError('Title and Author are required')
      return
    }

    if (!selectedClub.active_session) {
      onError('No active session to update')
      return
    }

    try {
      setLoading(true)
      onError('') // Clear any existing errors

      console.log('Updating book:', formData)

      // We'll update the session's book and due date using your existing session endpoint
      const requestBody = {
        id: selectedClub.active_session.id,
        book: {
          title: formData.title.trim(),
          author: formData.author.trim(),
          edition: formData.edition.trim() || undefined,
          year: formData.year.trim() ? parseInt(formData.year.trim()) : undefined
        },
        due_date: formData.due_date || undefined
      }

      console.log('Update request:', requestBody)

      const { data, error } = await supabase.functions.invoke('session', {
        method: 'PUT',
        body: requestBody
      })

      if (error) throw error

      console.log('Book updated successfully:', data)

      // Close modal and notify parent
      onClose()
      onBookUpdated()

    } catch (err: unknown) {
      console.error('Error updating book:', err)
      onError(
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Failed to update book'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onError('') // Clear errors when closing
    onClose()
  }

  if (!isOpen || !selectedClub.active_session) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 via-blue-900 to-slate-800 rounded-2xl border border-blue-300/30 p-6 w-full max-w-md shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">📖</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Edit Book</h2>
              <p className="text-blue-200/70 text-sm">Update current reading details</p>
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

          {/* Edition Field */}
          <div>
            <label className="block text-white font-medium mb-2">
              Edition <span className="text-white/50">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.edition}
              onChange={(e) => setFormData(prev => ({ ...prev, edition: e.target.value }))}
              placeholder="e.g., First, Paperback, 2nd Edition"
              className="w-full bg-white/10 backdrop-blur-md border border-blue-300/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              disabled={loading}
              maxLength={50}
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
              Due Date <span className="text-white/50">(optional)</span>
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className="w-full bg-white/10 backdrop-blur-md border border-blue-300/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
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
              Updating active reading session
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
            disabled={loading || !formData.title.trim() || !formData.author.trim()}
            className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-lg disabled:hover:scale-100 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Updating...</span>
              </>
            ) : (
              <span>Update Book</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}