import type { Club } from '../types'

interface MembersTableProps {
  selectedClub: Club
}

export default function MembersTable({ selectedClub }: MembersTableProps) {
  return (
    <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-blue-300/20 overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-blue-300/20 bg-gradient-to-r from-blue-600/10 to-orange-600/10">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-white flex items-center text-xl">
              <span className="mr-3 text-2xl">👥</span>
              Club Members ({selectedClub.members.length})
            </h3>
            <p className="text-blue-200/70 text-sm mt-1">Reading community overview</p>
          </div>
          
          {/* Add Member Button - Following DiscussionsTimeline pattern */}
          <div className="hidden md:flex">
            <button 
              onClick={() => {
                // TODO: Will implement in Step 2
                console.log('Add member clicked')
              }}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-blue-400/30"
            >
              + Add Member
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-blue-300/20 bg-blue-500/5">
              <th className="text-left py-4 px-6 text-blue-200 font-bold">Reader</th>
              <th className="text-center py-4 px-6 text-blue-200 font-bold">Points</th>
              <th className="text-center py-4 px-6 text-blue-200 font-bold">Books Read</th>
              <th className="text-left py-4 px-6 text-blue-200 font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {selectedClub.members.map(member => (
              <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-200 group">
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:scale-110 transition-transform duration-200">
                      {/* Discord SVG */}
                      <img 
                        src="/ic-discord.svg" 
                        alt="Discord" 
                        className="w-5 h-5 text-white"
                        onError={(e) => {
                          // Fallback to emoji if SVG not found
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.parentElement?.querySelector('.fallback-emoji') as HTMLElement;
                          if (fallback) {
                            fallback.style.display = 'inline';
                          }
                        }}
                      />
                      <span className="fallback-emoji text-white text-sm font-bold" style={{ display: 'none' }}>
                        🎮
                      </span>
                    </div>
                    <span className="text-white font-semibold">{member.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  <div className="flex items-center justify-center">
                    <span className="bg-blue-500/20 text-blue-200 px-3 py-1.5 rounded-full text-sm font-bold border border-blue-400/30">
                      {member.points} pts
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  <div className="flex items-center justify-center">
                    <span className="text-white/90 font-medium mr-2">{member.books_read}</span>
                    <span className="text-orange-300">📚</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  {selectedClub.shame_list.includes(member.id) ? (
                    <span className="bg-red-500/20 text-red-300 px-3 py-1.5 rounded-full text-xs font-bold border border-red-400/30 flex items-center w-fit">
                      <span className="mr-1">😰</span>
                      Shame List
                    </span>
                  ) : (
                    <span className="bg-green-500/20 text-green-300 px-3 py-1.5 rounded-full text-xs font-bold border border-green-400/30 flex items-center w-fit">
                      <span className="mr-1">✨</span>
                      Good Standing
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}