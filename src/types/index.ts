export interface Server {
  id: string
  name: string
  clubs: Club[]
}

export interface Club {
  id: string
  name: string
  discord_channel: string
  server_id: string
  members: Member[]
  active_session: Session | null
  past_sessions: Session[]
  shame_list: number[]
}

export interface Session {
  id: string
  book: Book
  due_date: string
  discussions: Discussion[]
}

export interface Discussion {
  id: string
  title: string
  date: string
  location?: string
}

export interface Book {
  title: string
  author: string
  edition?: string
  year?: number
  isbn?: string
}

export interface Member {
  id: number
  name: string
  points: number
  books_read: number
  clubs: string[]
}