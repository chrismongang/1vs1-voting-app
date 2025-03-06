"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getPlayers, validateToken, voteForPlayer } from "@/lib/actions"
import type { Player } from "@/lib/definitions"
import Image from "next/image"

export default function VotePage() {
  const searchParams = useSearchParams()
  const token = searchParams?.get("token")
  const router = useRouter()

  const [user, setUser] = useState<{ id: string; has_voted: boolean } | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [voting, setVoting] = useState(false)

  useEffect(() => {
    if (!token) {
      router.push("/1vs1-events/voting")
      return
    }

    async function initialize() {
      try {
        const { valid, user, error } = await validateToken(token)

        if (!valid || !user) {
          setError(error || "Ungültiger Token. Bitte scanne den QR-Code erneut.")
          setLoading(false)
          return
        }

        if (user.has_voted) {
          router.push(`/1vs1-events/voting/results?token=${token}`)
          return
        }

        setUser(user)
        const playersData = await getPlayers()
        setPlayers(playersData)
      } catch (err) {
        setError("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.")
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [token, router])

  // Frühe Rückgabe, wenn kein Token vorhanden ist.  This prevents conditional hook calls.
  if (!token) {
    return null;
  }

  async function handleVote(playerId: string) {
    if (!user || !token) {
      setError("Ungültige Sitzung. Bitte versuche es erneut.")
      return
    }

    setVoting(true)
    setError(null)

    try {
      await voteForPlayer(user.id, playerId)
      router.push(`/1vs1-events/voting/results?token=${token}`)
    } catch (err: any) {
      setError(err.message || "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.")
      setVoting(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-4">Wähle deinen Favoriten!</h1>
      {players.map((player) => (
        <div key={player.id} className="mb-4">
          <button
            onClick={() => handleVote(player.id)}
            disabled={voting}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {voting ? "Wird gewählt..." : `Für ${player.name} stimmen`}
          </button>
          <Image src={player.image_url || "/placeholder.svg"} alt={player.name} width={200} height={200} />
        </div>
      ))}
    </div>
  )
}