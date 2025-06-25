import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'
import type { Club, Server, Member } from '../../types'

interface MemberModalProps {
  isOpen: boolean
  onClose: () => void
  selectedClub: Club
  selectedServerData: Server | undefined
  onMemberSaved: () => void
  onError: (error: string) => void
  editingMember?: Member // If provided, we're editing instead of adding
}

interface MemberFormData {
  name: string
  points: string
  books_read: string
  on_shame_list: boolean
}

export default function MemberModal({
  isOpen,
  onClose,
  selectedClub,
  selectedServerData,
  onMemberSaved,
  onError,
  editingMember
}: MemberModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    points: '0',
    books_read: '0',
    on_shame_list: false
  })

  const isEditing = !!editingMember

  // Pre-populate form when editing
  useEffect(() => {
    if (isOpen) {
      if (editingMember) {
        // Edit mode - pre-populate with existing data
        const isOnShameList = selectedClub.shame_list.includes(editingMember.id)
        setFormData({
          name: editingMember.name,
          points: String(editingMember.points),
          books_read: String(editingMember.books_read),
          on_shame_list: isOnShameList
        })
      } else {
        // Add mode - reset to defaults
        setFormData({
          name: '',
          points: '0',
          books_read: '0',
          on_shame_list: false
        })
      }
    }
  }, [isOpen, editingMember])

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      onError('Member name is required')
      return false
    }

    const points = parseInt(formData.points)
    const booksRead = parseInt(formData.books_read)

    if (isNaN(points) || points < 0) {
      onError('Points must be a non-negative number')
      return false
    }

    if (isNaN(booksRead) || booksRead < 0) {
      onError('Books read must be a non-negative number')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      onError('') // Clear any existing errors

      const memberData = {
        name: formData.name.trim(),
        points: parseInt(formData.points),
        books_read: parseInt(formData.books_read)
      }

      if (isEditing && editingMember) {
        // Edit mode - update existing member
        const requestBody = {
          id: editingMember.id,
          ...memberData
        }

        const { data, error } = await supabase.functions.invoke('member', {
          method: 'PUT',
          body: requestBody
        })

        if (error) throw error

        // Handle shame list update separately for edit mode
        if (formData.on_shame_list !== selectedClub.shame_list.includes(editingMember.id)) {
          let newShameList = [...selectedClub.shame_list]
          if (formData.on_shame_list) {
            // Add to shame list
            if (!newShameList.includes(editingMember.id)) {
              newShameList.push(editingMember.id)
            }
          } else {
            // Remove from shame list
            newShameList = newShameList.filter(id => id !== editingMember.id)
          }

          const { error: shameError } = await supabase.functions.invoke('club', {
            method: 'PUT',
            body: {
              id: selectedClub.id,
              server_id: selectedServerData?.id,
              shame_list: newShameList
            }
          })

          if (shameError) {
            console.error('Error updating shame list:', shameError)
            onError('Member updated but failed to update shame list status')
          }
        }
      } else {
        // Add mode - create new member and add to club
        const requestBody = {
          ...memberData,
          clubs: [selectedClub.id] // Add them to this specific club
        }

        const { data, error } = await supabase.functions.invoke('member', {
          method: 'POST',
          body: requestBody
        })

        if (error) throw error

        // Handle shame list for new member
        if (formData.on_shame_list && data.member) {
          const newShameList = [...selectedClub.shame_list, data.member.id]

          const { error: shameError } = await supabase.functions.invoke('club', {
            method: 'PUT',
            body: {
              id: selectedClub.id,
              server_id: selectedServerData?.id,
              shame_list: newShameList
            }
          })

          if (shameError) {
            console.error('Error adding to shame list:', shameError)
            onError('Member created but failed to add to shame list')
          }
        }
      }

      // Reset form and close modal
      setFormData({ name: '', points: '0', books_read: '0', on_shame_list: false })
      onClose()
      
      // Notify parent component of successful save
      onMemberSaved()

    } catch (err: unknown) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} member:`, err)
      onError(
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : `Failed to ${isEditing ? 'update' : 'add'} member`
      )
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ name: '', points: '0', books_read: '0', on_shame_list: false })
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
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">👤</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'Edit Member' : 'Add Member'}
              </h2>
              <p className="text-blue-200/70 text-sm">
                {isEditing ? 'Update member details' : 'Add a new member to the club'}
              </p>
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
          {/* Member Name Field */}
          <div>
            <label className="block text-white font-medium mb-2">
              Member Name <span className="text-orange-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., BookLover42"
              className="w-full bg-white/10 backdrop-blur-md border border-blue-300/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
              disabled={loading}
              maxLength={100}
            />
          </div>

          {/* Points Field */}
          <div>
            <label className="block text-white font-medium mb-2">
              Points
            </label>
            <input
              type="number"
              value={formData.points}
              onChange={(e) => setFormData(prev => ({ ...prev, points: e.target.value }))}
              placeholder="0"
              min="0"
              className="w-full bg-white/10 backdrop-blur-md border border-blue-300/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              disabled={loading}
            />
            <p className="text-blue-200/60 text-xs mt-1">
              🏆 Member's current point total
            </p>
          </div>

          {/* Books Read Field */}
          <div>
            <label className="block text-white font-medium mb-2">
              Books Read
            </label>
            <input
              type="number"
              value={formData.books_read}
              onChange={(e) => setFormData(prev => ({ ...prev, books_read: e.target.value }))}
              placeholder="0"
              min="0"
              className="w-full bg-white/10 backdrop-blur-md border border-blue-300/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              disabled={loading}
            />
            <p className="text-blue-200/60 text-xs mt-1">
              📚 Number of books completed
            </p>
          </div>

          {/* Shame List Toggle - Material 3 Style */}
          <div>
            <label className="block text-white font-medium mb-3">
              Shame List Status
            </label>
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-md border border-blue-300/30 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                  formData.on_shame_list 
                    ? 'bg-red-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}>
                  <span className="text-sm">
                    {formData.on_shame_list ? '😰' : '✨'}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {formData.on_shame_list ? 'On Shame List' : 'Good Standing'}
                  </p>
                  <p className="text-blue-200/60 text-xs">
                    {formData.on_shame_list 
                      ? 'Member has fallen behind on reading' 
                      : 'Member is up to date with reading'
                    }
                  </p>
                </div>
              </div>
              
              {/* Material 3 Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.on_shame_list}
                  onChange={(e) => setFormData(prev => ({ ...prev, on_shame_list: e.target.checked }))}
                  className="sr-only peer"
                  disabled={loading}
                />
                <div className={`relative w-14 h-8 rounded-full transition-all duration-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-400/20 ${
                  formData.on_shame_list 
                    ? 'bg-red-500' 
                    : 'bg-white/20'
                } peer-checked:bg-red-500`}>
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
                    formData.on_shame_list ? 'translate-x-6' : 'translate-x-0'
                  }`}>
                    <span className="text-xs">
                      {formData.on_shame_list ? '😰' : '✨'}
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Club Context */}
          <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-3">
            <p className="text-blue-200 text-sm font-medium">
              📚 Club: <span className="text-white">{selectedClub.name}</span>
            </p>
            <p className="text-blue-200/60 text-xs mt-1">
              {isEditing ? 'Updating member in' : 'Adding member to'} this club
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
            className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-lg disabled:hover:scale-100 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>{isEditing ? 'Updating...' : 'Adding...'}</span>
              </>
            ) : (
              <span>{isEditing ? 'Update Member' : 'Add Member'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}