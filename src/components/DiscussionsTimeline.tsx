import { useEffect, useRef } from 'react'
import type { Club } from '../types'

interface DiscussionsTimelineProps {
  selectedClub: Club
  onAddDiscussion: () => void
  onEditDiscussion?: (discussion: any) => void
  onDeleteDiscussion?: (discussion: any) => void
}

export default function DiscussionsTimeline({ 
  selectedClub, 
  onAddDiscussion,
  onEditDiscussion,
  onDeleteDiscussion 
}: DiscussionsTimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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

  // Find next upcoming discussion
  const nextDiscussionIndex = sortedDiscussions.findIndex(
    discussion => !isPastDiscussion(discussion.date)
  )

  // Auto-scroll to next discussion on load
  useEffect(() => {
    if (scrollContainerRef.current && nextDiscussionIndex >= 0) {
      const container = scrollContainerRef.current
      const discussionCards = container.querySelectorAll('.discussion-card')
      const targetCard = discussionCards[nextDiscussionIndex] as HTMLElement
      
      if (targetCard) {
        const containerWidth = container.offsetWidth
        const cardLeft = targetCard.offsetLeft
        const cardWidth = targetCard.offsetWidth
        const scrollPosition = cardLeft - (containerWidth / 2) + (cardWidth / 2)
        
        container.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth'
        })
      }
    }
  }, [nextDiscussionIndex, sortedDiscussions.length])

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.getDate(),
      year: date.getFullYear(),
      full: date.toLocaleDateString()
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

      <div className="p-6 pb-8 pt-8">
        {sortedDiscussions.length === 0 ? (
          /* Empty State */
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-white/60 font-medium">No discussions scheduled</p>
            <p className="text-blue-200/50 text-sm mt-1">Add your first discussion to get started!</p>
          </div>
        ) : (
          /* Scrollable Horizontal Timeline */
          <div className="relative pb-4 pt-6">
            {/* Scrollable container */}
            <div 
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto pb-6 px-4 pt-4"
              style={{ 
                scrollSnapType: 'x mandatory',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
              }}
            >
              {sortedDiscussions.map((discussion, index) => {
                const isPast = isPastDiscussion(discussion.date)
                const dateInfo = formatDate(discussion.date)
                const isNext = index === nextDiscussionIndex
                
                return (
                  <div 
                    key={discussion.id} 
                    className={`discussion-card flex-shrink-0 w-64 relative transition-all duration-300 ${
                      isNext ? 'scale-105' : 'scale-100'
                    }`}
                    style={{ scrollSnapAlign: 'center' }}
                  >
                    {/* Discussion Card */}
                    <div className={`group bg-white/5 backdrop-blur-sm rounded-xl p-4 border transition-all duration-200 hover:bg-white/10 relative ${
                      isPast 
                        ? 'border-gray-500/30 opacity-60' 
                        : isNext
                        ? 'border-orange-400/50 bg-orange-500/5'
                        : 'border-blue-400/30 hover:border-orange-400/50'
                    }`}>
                      
                      {/* Edit/Delete buttons - appear on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditDiscussion?.(discussion)
                        }}
                        className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 p-1.5 rounded-lg border border-blue-400/30 hover:border-blue-400/50"
                        title="Edit discussion"
                      >
                        <span className="text-sm">✏️</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteDiscussion?.(discussion)
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 p-1.5 rounded-lg border border-red-400/30 hover:border-red-400/50"
                        title="Delete discussion"
                      >
                        <span className="text-sm">🗑️</span>
                      </button>

                      {/* Status Indicator */}
                      <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold mb-3 ${
                        isPast 
                          ? 'bg-gray-500/20 text-gray-300' 
                          : isNext
                          ? 'bg-orange-500/20 text-orange-200'
                          : 'bg-blue-500/20 text-blue-200'
                      }`}>
                        <span className="mr-1">
                          {isPast ? '✅' : isNext ? '⭐' : '📅'}
                        </span>
                        {isPast ? 'Completed' : isNext ? 'Next Up' : 'Upcoming'}
                      </div>

                      {/* Date Badge */}
                      <div className={`text-sm font-medium mb-2 ${
                        isPast ? 'text-gray-400' : 'text-blue-200'
                      }`}>
                        {dateInfo.full}
                      </div>

                      {/* Discussion Title */}
                      <h4 className={`font-bold mb-3 text-sm leading-tight ${
                        isPast ? 'text-white/50' : 'text-white'
                      }`}>
                        {discussion.title}
                      </h4>

                      {/* Location - always show something */}
                      <div className={`flex items-center text-xs mb-3 ${
                        isPast ? 'text-gray-400' : 'text-blue-300'
                      }`}>
                        <span className="mr-1">📍</span>
                        <span className="truncate">
                          {discussion.location || 'Location TBD'}
                        </span>
                      </div>

                      {/* Timeline connector dot */}
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className={`w-3 h-3 rounded-full border-2 ${
                          isPast 
                            ? 'bg-gray-500/50 border-gray-400/50' 
                            : isNext
                            ? 'bg-orange-500 border-orange-400 animate-pulse'
                            : 'bg-blue-500 border-blue-400'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Timeline base line */}
            <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-blue-500/30 via-blue-400/50 to-orange-500/30"></div>
          </div>
        )}
      </div>
    </div>
  )
}