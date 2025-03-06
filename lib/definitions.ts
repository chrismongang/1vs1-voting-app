// Typdefinitionen für unsere Datenbanktabellen
export type Player = {
    id: string
    name: string
    player_number: number
    image_url: string | null
    votes: number
    created_at: string
  }
  
  export type User = {
    id: string
    token: string
    has_voted: boolean
    voted_for: string | null
    created_at: string
  }
  
  export type Vote = {
    id: string
    user_id: string
    player_id: string
    created_at: string
  }
  
  