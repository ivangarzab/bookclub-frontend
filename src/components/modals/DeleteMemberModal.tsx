import { useState } from 'react'
import { supabase } from '../../supabase'

interface DeleteMemberModalProps {
  isOpen: boolean
  onClose: () => void
  memberToDelete: any
  onMemberDeleted: () => void
  onError: (error: string) => void
}

export default function DeleteMemberModal({
  isOpen,
  onClose,
  memberToDelete,
  onMemberDeleted,
  onError
}: DeleteMemberModalProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!memberToDelete) return

    try {
      setLoading(true)
      onError('') // Clear any existing errors

      console.log('Deleting member:', memberToDelete)

      const { data, error } = await supabase.functions.invoke(`member?id=${encodeURIComponent(memberToDelete.id)}`, {
        method: 'DELETE'
      })

      if (error) throw error

      console.log('Member deleted successfully:', data)

      // Close modal and notify parent
      onClose()
      onMemberDeleted()

    } catch (err: unknown) {
      console.error('Error deleting member:', err)
      onError(
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Failed to delete member'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !memberToDelete) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 via-red-900/20 to-slate-800 rounded-2xl border border-red-300/30 p-6 w-full max-w-md shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-12 w-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">⚠️</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Delete Member</h2>
            <p className="text-red-200/70 text-sm">This action cannot be undone</p>
          </div>
        </div>

        {/* Warning Content */}
        <div className="mb-6">
          <p className="text-white mb-3">
            Are you sure you want to remove <span className="font-bold text-orange-300">"{memberToDelete.name}"</span> from this club?
          </p>
          <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-4">
            <p className="text-red-200 text-sm font-medium mb-2">⚠️ This will permanently:</p>
            <ul className="text-red-200/80 text-sm space-y-1 ml-4">
              <li>• Remove them from this club</li>
              <li>• Remove any shame list entries</li>
              <li>• Delete all member associations</li>
              <li>• Cannot be recovered</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-lg disabled:hover:scale-100 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Member</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}