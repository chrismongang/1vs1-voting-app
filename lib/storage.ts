import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funktion zum Hochladen eines Bildes
export async function uploadPlayerImage(file: File, playerId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${playerId}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage.from("player-images").upload(filePath, file, {
      upsert: true,
    })

    if (uploadError) {
      console.error("Fehler beim Hochladen:", uploadError)
      return null
    }

    // Öffentliche URL des Bildes abrufen
    const { data } = supabase.storage.from("player-images").getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error("Fehler:", error)
    return null
  }
}

// Funktion zum Abrufen der öffentlichen URL eines Bildes
export function getPlayerImageUrl(imagePath: string): string {
  const { data } = supabase.storage.from("player-images").getPublicUrl(imagePath)

  return data.publicUrl
}

// Funktion zum Löschen eines Bildes
export async function deletePlayerImage(imagePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from("player-images").remove([imagePath])

    if (error) {
      console.error("Fehler beim Löschen:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Fehler:", error)
    return false
  }
}

