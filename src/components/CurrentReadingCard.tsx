import type { Club } from '../types'

interface CurrentReadingCardProps {
  selectedClub: Club
  onEditBook: () => void
  onNewSession: () => void
}

export default function CurrentReadingCard({
  selectedClub,
  onEditBook,
  onNewSession
}: CurrentReadingCardProps) {
  if (!selectedClub.active_session) {
    // Empty state when no active session
    return (
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-blue-300/20 p-8 text-center shadow-xl">
        <div className="max-w-md mx-auto">
          <div className="h-20 w-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📖</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No Active Reading</h3>
          <p className="text-white/60 mb-6">This club doesn't have an active reading session. Start one to get the conversation going!</p>
          <button 
            onClick={onNewSession}
            className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-lg"
          >
            + Start New Session
          </button>
        </div>
      </div>
    )
  }

  // Active session state
  return (
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
                onClick={onEditBook}
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-blue-400/30"
              >
                Edit Book
              </button>
              <button 
                onClick={onNewSession}
                className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-orange-400/30"
              >
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
  )
}