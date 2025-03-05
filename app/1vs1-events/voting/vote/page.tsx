'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { validateToken, getPlayers, voteForPlayer, type Player, type User } from '@/lib/supabase-client';

export default function VotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [user, setUser] = useState<User | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Wenn kein Token vorhanden ist, zur Landing Page zurückleiten
    if (!token) {
      router.push('/1vs1-events/voting');
      return;
    }
    
    async function initialize() {
      try {
        // Token validieren
        const { valid, user, error } = await validateToken(token);
        
        if (!valid) {
          setError(error || 'Ungültiger Token. Bitte scanne den QR-Code erneut.');
          setLoading(false);
          return;
        }
        
        if (user.has_voted) {
          // Wenn der Benutzer bereits abgestimmt hat, zur Ergebnisseite weiterleiten
          router.push(`/1vs1-events/voting/results?token=${token}`);
          return;
        }
        
        setUser(user);
        
        // Spieler laden
        const playersData = await getPlayers();
        setPlayers(playersData);
      } catch (err) {
        setError('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
      } finally {
        setLoading(false);
      }
    }
    
    initialize();
  }, [token, router]);
  
  async function handleVote(playerId: string) {
    if (!user) return;
    
    setVoting(true);
    setError(null);
    
    try {
      await voteForPlayer(user.id, playerId);
      // Nach erfolgreicher Abstimmung zur Ergebnisseite weiterleiten
      router.push(`/1vs1-events/voting/results?token=${token}`);
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
      setVoting(false);
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-t-2 border-white rounded-full animate-spin mb-4"></div>
        <p>Lade Spielerdaten...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 mb-6">
            <p className="text-lg font-medium mb-2">Fehler</p>
            <p className="text-zinc-300">{error}</p>
            <button
              onClick={() => window.location.href = '/1vs1-events/voting'}
              className="mt-4 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition"
            >
              Zurück
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Wähle deinen Lieblingsspieler</h1>
        <p className="text-center text-zinc-400 mb-8">
          Stimme für den Spieler ab, der dich heute am meisten beeindruckt hat!
        </p>
        
        {voting ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-t-2 border-white rounded-full animate-spin mb-4"></div>
            <p>Deine Stimme wird gespeichert...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => handleVote(player.id)}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg p-4 transition focus:outline-none focus:ring-2 focus:ring-white/25"
              >
                <div className="aspect-square relative mb-3 overflow-hidden rounded-lg">
                  {player.image_url ? (
                    <Image
                      src={player.image_url || "/placeholder.svg"}
                      alt={player.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                      <span className="text-4xl font-bold text-zinc-600">
                        {player.player_number}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-medium">{player.name}</h3>
                <p className="text-zinc-400">Spieler #{player.player_number}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}