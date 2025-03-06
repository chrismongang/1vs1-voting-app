"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { uploadPlayerImage } from "@/lib/storage"
import { getPlayerById, updatePlayer } from "@/lib/actions" // Diese Funktionen musst du noch implementieren
import type { Player } from "@/lib/definitions"

export default function EditPlayerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [player, setPlayer] = useState<Player | null>(null)
  const [name, setName] = useState("")
  const [playerNumber, setPlayerNumber] = useState(0)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPlayer() {
      try {
        const playerData = await getPlayerById(params.id)
        setPlayer(playerData)
        setName(playerData.name)
        setPlayerNumber(playerData.player_number)
        if (playerData.image_url) {
          setImagePreview(playerData.image_url)
        }
      } catch (err) {
        setError("Fehler beim Laden des Spielers")
      } finally {
        setLoading(false)
      }
    }

    loadPlayer()
  }, [params.id])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Vorschau erstellen
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      let imageUrl = player?.image_url || null

      // Wenn ein neues Bild hochgeladen wurde
      if (imageFile) {
        imageUrl = await uploadPlayerImage(imageFile, params.id)
        if (!imageUrl) {
          throw new Error("Fehler beim Hochladen des Bildes")
        }
      }

      // Spieler aktualisieren
      await updatePlayer(params.id, {
        name,
        player_number: playerNumber,
        image_url: imageUrl,
      })

      router.push("/admin/players")
    } catch (err: any) {
      setError(err.message || "Ein Fehler ist aufgetreten")
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error && !player) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Spieler bearbeiten</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Spielernummer</label>
          <input
            type="number"
            value={playerNumber}
            onChange={(e) => setPlayerNumber(Number.parseInt(e.target.value))}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bild</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="mt-1 block w-full" />

          {imagePreview && (
            <div className="mt-2">
              <Image
                src={imagePreview || "/placeholder.svg"}
                alt="Vorschau"
                width={200}
                height={200}
                className="rounded-md object-cover"
              />
            </div>
          )}
        </div>

        {error && <div className="text-red-500">{error}</div>}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.push("/admin/players")}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Abbrechen
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? "Wird gespeichert..." : "Speichern"}
          </button>
        </div>
      </form>
    </div>
  )
}

