import { createClient } from "@supabase/supabase-js"
import type { Player, User } from "./definitions"

// Erstelle den Supabase-Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funktion zum Überprüfen, ob ein Token gültig ist
export async function validateToken(token: string): Promise<{
  valid: boolean
  user: User | null
  error: string | null
}> {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("token", token).single()

    if (error) {
      return { valid: false, user: null, error: error.message }
    }

    return { valid: true, user: data as User, error: null }
  } catch (err) {
    return { valid: false, user: null, error: "Ein Fehler ist aufgetreten" }
  }
}

// Funktion zum Abrufen aller Spieler
export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase.from("players").select("*").order("player_number", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data as Player[]
}

// Funktion zum Abstimmen für einen Spieler
export async function voteForPlayer(userId: string, playerId: string): Promise<{ success: boolean }> {
  try {
    // Prüfe, ob der Benutzer bereits abgestimmt hat
    const { data: user, error: userError } = await supabase.from("users").select("has_voted").eq("id", userId).single()

    if (userError || !user) {
      throw new Error("Benutzer nicht gefunden")
    }

    if (user.has_voted) {
      throw new Error("Du hast bereits abgestimmt")
    }

    // Speichere die Stimme
    const { error: voteError } = await supabase.from("votes").insert([{ user_id: userId, player_id: playerId }])

    if (voteError) {
      throw new Error(voteError.message)
    }

    // Markiere den Benutzer als "hat abgestimmt"
    const { error: updateUserError } = await supabase
      .from("users")
      .update({ has_voted: true, voted_for: playerId })
      .eq("id", userId)

    if (updateUserError) {
      throw new Error(updateUserError.message)
    }

    // Erhöhe die Stimmen des Spielers
    const { error: updatePlayerError } = await supabase
      .from("players")
      .update({ votes: supabase.rpc("increment", { x: 1 }) })
      .eq("id", playerId)

    if (updatePlayerError) {
      throw new Error(updatePlayerError.message)
    }

    return { success: true }
  } catch (error) {
    throw error
  }
}

// Funktion zum Abrufen eines Spielers anhand seiner ID
export async function getPlayerById(playerId: string): Promise<Player> {
  const { data, error } = await supabase.from("players").select("*").eq("id", playerId).single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Player
}

// Funktion zum Aktualisieren eines Spielers
export async function updatePlayer(
  playerId: string,
  updates: {
    name?: string
    player_number?: number
    image_url?: string | null
  },
): Promise<Player> {
  const { data, error } = await supabase.from("players").update(updates).eq("id", playerId).select().single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Player
}

// Funktion zum Erstellen eines neuen Spielers
export async function createPlayer(playerData: {
  name: string
  player_number: number
  image_url?: string | null
}): Promise<Player> {
  const { data, error } = await supabase.from("players").insert([playerData]).select().single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Player
}

// Funktion zum Löschen eines Spielers
export async function deletePlayer(playerId: string): Promise<boolean> {
  const { error } = await supabase.from("players").delete().eq("id", playerId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

