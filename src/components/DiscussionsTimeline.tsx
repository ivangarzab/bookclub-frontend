import type { Club } from '../types'

interface DiscussionsTimelineProps {
  selectedClub: Club
  onAddDiscussion: () => void
}

export default function DiscussionsTimeline({ selectedClub, onAddDiscussion }: DiscussionsTimelineProps) {
  // Don't show timeline if no active session
  if (!selectedClub.active_session) {
    return null
  }

  const now = new Date()
  
  // Sort discussions chronologically
  const sortedDiscussions = [...selectedClub.active_session.discussions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Helper function to determine if discussion is in the past
  const isPastDiscussion = (date: string) => new Date(date) < now

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.getDate(),
      year: date.getFullYear()
    }
  }

  return (
    <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-blue-300/20 overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-blue-300/20 bg-gradient-to-r from-blue-600/10 to-orange-600/10">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-white flex items-center text-xl">
              <span className="mr-3 text-2xl">💬</span>
              Discussion Timeline ({sortedDiscussions.length})
            </h3>
            <p className="text-blue-200/70 text-sm mt-1">Reading session discussions & events</p>
          </div>
          
          {/* Action Button Area - Top Right */}
          <div className="hidden md:flex">
            <button 
              onClick={onAddDiscussion}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-blue-400/30"
            >
              + Add Discussion
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {sortedDiscussions.length === 0 ? (
          /* Empty State */
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-white/60 font-medium">No discussions scheduled</p>
            <p className="text-blue-200/50 text-sm mt-1">Add your first discussion to get started!</p>
          </div>
        ) : (
          /* Timeline */
          <div className="relative">
            {/* Timeline Base Line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/30 via-blue-400/50 to-orange-500/30"></div>
            
            {/* Timeline Items */}
            <div className="flex items-start justify-between relative">
              {sortedDiscussions.map((discussion, index) => {
                const isPast = isPastDiscussion(discussion.date)
                const dateInfo = formatDate(discussion.date)
                const isLast = index === sortedDiscussions.length - 1
                
                return (
                  <div 
                    key={discussion.id} 
                    className={`flex-1 ${!isLast ? 'mr-4' : ''} group relative`}
                  >
                    {/* Timeline Node */}
                    <div className="flex justify-center mb-4">
                      <div className={`w-4 h-4 rounded-full border-2 transition-all duration-200 relative z-10 ${
                        isPast 
                          ? 'bg-gray-500/50 border-gray-400/50' 
                          : 'bg-blue-500 border-blue-400 group-hover:scale-125 group-hover:bg-orange-500 group-hover:border-orange-400'
                      }`}>
                        {!isPast && (
                          <div className="absolute -inset-1 bg-blue-400/30 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>

                    {/* Discussion Card */}
                    <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-4 border transition-all duration-200 hover:bg-white/10 cursor-pointer ${
                      isPast 
                        ? 'border-gray-500/30 opacity-60' 
                        : 'border-blue-400/30 hover:border-orange-400/50'
                    }`}>
                      {/* Date Badge */}
                      <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold mb-2 ${
                        isPast 
                          ? 'bg-gray-500/20 text-gray-300' 
                          : 'bg-blue-500/20 text-blue-200'
                      }`}>
                        <span className="mr-1">📅</span>
                        {dateInfo.month} {dateInfo.day}
                        {dateInfo.year !== now.getFullYear() && `, ${dateInfo.year}`}
                      </div>

                      {/* Discussion Title */}
                      <h4 className={`font-bold mb-2 text-sm leading-tight ${
                        isPast ? 'text-white/50' : 'text-white'
                      }`}>
                        {discussion.title}
                      </h4>

                      {/* Location */}
                      {discussion.location && (
                        <div className={`flex items-center text-xs ${
                          isPast ? 'text-gray-400' : 'text-blue-300'
                        }`}>
                          <span className="mr-1">📍</span>
                          {discussion.location}
                        </div>
                      )}

                      {/* Status Indicator */}
                      <div className={`flex items-center justify-between mt-3 ${
                        isPast ? 'text-gray-500' : 'text-blue-400'
                      }`}>
                        <span className="text-xs font-medium">
                          {isPast ? 'Completed' : 'Upcoming'}
                        </span>
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          isPast ? 'bg-gray-500' : 'bg-blue-400 animate-pulse'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}