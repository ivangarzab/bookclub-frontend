export interface Club {
  id: string
  name: string
  discord_channel: string
  server_id: string
  members: Array<{
    id: number
    name: string
    points: number
    books_read: number
    clubs: string[]
  }>
  active_session: {
    id: string
    book: {
      title: string
      author: string
      edition?: string
      year?: number
      isbn?: string
    }
    due_date: string
    discussions: Array<{
      id: string
      title: string
      date: string
      location?: string
    }>
  } | null
  past_sessions: Array<{
    id: string
    due_date: string
  }>
  shame_list: number[]
}

export interface Server {
  id: string
  name: string
  clubs: Club[]
}