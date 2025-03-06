"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getPlayers, updatePlayer } from "@/lib/actions"
import type { Player } from "@/lib/definitions"
import { createClient } from "@supabase/supabase-js"
import Image from "next/image"

// Initialisiere Supabase-Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function UploadPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [imageFiles, setImageFiles] = useState<Record<string, File | null>>({})
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function loadPlayers() {
      try {
        const playersData = await getPlayers()
        setPlayers(playersData)

        // Initialisiere Bildvorschauen mit vorhandenen Bildern
        const previews: Record<string, string> = {}
        playersData.forEach((player) => {
          if (player.image_url) {
            previews[player.id] = player.image_url
          }
        })
        setImagePreviews(previews)
      } catch (err) {
        setError("Fehler beim Laden der Spieler")
      } finally {
        setLoading(false)
      }
    }

    loadPlayers()
  }, [])

  const handleImageChange = (playerId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Aktualisiere die Datei im State
      setImageFiles((prev) => ({
        ...prev,
        [playerId]: file,
      }))

      // Erstelle eine Vorschau
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => ({
          ...prev,
          [playerId]: reader.result as string,
        }))
      }
      reader.readAsDataURL(file)

      // Setze Erfolg zurück
      setSuccess((prev) => ({
        ...prev,
        [playerId]: false,
      }))
    }
  }

  const uploadImage = async (playerId: string) => {
    const file = imageFiles[playerId]
    if (!file) return null

    const fileExt = file.name.split(".").pop()
    const fileName = `${playerId}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error, data } = await supabase.storage.from("player-images").upload(filePath, file, {
      upsert: true,
    })

    if (error) {
      console.error("Fehler beim Hochladen:", error)
      return null
    }

    // Öffentliche URL abrufen
    const { data: urlData } = supabase.storage.from("player-images").getPublicUrl(filePath)

    return urlData.publicUrl
  }

  const handleUpload = async (playerId: string) => {
    if (!imageFiles[playerId]) {
      return
    }

    setUploading((prev) => ({
      ...prev,
      [playerId]: true,
    }))
    setError(null)

    try {
      const imageUrl = await uploadImage(playerId)

      if (!imageUrl) {
        throw new Error("Bild konnte nicht hochgeladen werden")
      }

      // Spieler in der Datenbank aktualisieren
      await updatePlayer(playerId, {
        image_url: imageUrl,
      })

      // Erfolg anzeigen
      setSuccess((prev) => ({
        ...prev,
        [playerId]: true,
      }))

      // Datei aus dem State entfernen
      setImageFiles((prev) => ({
        ...prev,
        [playerId]: null,
      }))
    } catch (err: any) {
      setError(`Fehler: ${err.message}`)
    } finally {
      setUploading((prev) => ({
        ...prev,
        [playerId]: false,
      }))
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Spieler werden geladen...</div>
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Spielerbilder hochladen</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {players.map((player) => (
          <div key={player.id} className="border rounded-lg p-4 flex flex-col">
            <h2 className="text-lg font-semibold">{player.name}</h2>
            <p className="text-gray-500 mb-2">#{player.player_number}</p>

            {imagePreviews[player.id] && (
              <div className="mb-3">
                <Image
                  src={imagePreviews[player.id] || "/placeholder.svg"}
                  alt={player.name}
                  width={200}
                  height={200}
                  className="rounded-md object-cover"
                />
              </div>
            )}

            <div className="mt-auto">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(player.id, e)}
                className="mb-2 w-full"
              />

              <button
                onClick={() => handleUpload(player.id)}
                disabled={!imageFiles[player.id] || uploading[player.id]}
                className={`w-full py-2 px-4 rounded ${
                  !imageFiles[player.id]
                    ? "bg-gray-300 cursor-not-allowed"
                    : success[player.id]
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {uploading[player.id]
                  ? "Wird hochgeladen..."
                  : success[player.id]
                    ? "Erfolgreich hochgeladen ✓"
                    : "Hochladen"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

