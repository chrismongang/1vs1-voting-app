'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { validateToken, getPlayers, subscribeToResults, type Player } from '@/lib/supabase-client';

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
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
        
        if (!user.has_voted) {
          // Wenn der Benutzer noch nicht abgestimmt hat, zur Abstimmungsseite weiterleiten
          router.push(`/1vs1-events/voting/vote?token=${token}`);
          return;
        }
        
        // Spieler laden
        const playersData = await getPlayers();
        // Sortiere Spieler nach Anzahl der Stimmen (absteigend)
        playersData.sort((a, b) => b.votes - a.votes);
        setPlayers(playersData);
      } catch (err) {
        setError('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
      } finally {
        setLoading(false);
      }
    }
    
    initialize();
    
    // Echtzeit-Updates für die Ergebnisse abonnieren
    const unsubscribe = subscribeToResults((updatedPlayers) => {
      // Sortiere Spieler nach Anzahl der Stimmen (absteigend)
      updatedPlayers.sort((a, b) => b.votes - a.votes);
      setPlayers(updatedPlayers);
    });
    
    // Abonnement aufheben, wenn die Komponente unmontiert wird
    return () => {
      unsubscribe();
    };
  }, [token, router]);
  
  // Funktion zum Anzeigen des Feedback-Formulars
  function handleShowFeedback() {
    setShowFeedback(true);
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-t-2 border-white rounded-full animate-spin mb-4"></div>
        <p>Lade Ergebnisse...</p>
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
  
  // Berechne die Gesamtzahl der Stimmen
  const totalVotes = players.reduce((sum, player) => sum + player.votes, 0);
  
  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Live Ergebnisse</h1>
        <p className="text-center text-zinc-400 mb-8">
          Insgesamt abgegebene Stimmen: {totalVotes}
        </p>
        
        {showFeedback ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-8">
            <h2 className="text-xl font-bold mb-4">Dein Feedback ist uns wichtig!</h2>
            <iframe
              src="https://form.typeform.com/to/your-typeform-id-here"
              className="w-full h-[500px] border-0"
              title="Feedback Formular"
            ></iframe>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Folge Chris Mongang auf Social Media</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="https://instagram.com/chrismongang"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  Instagram
                </Link>
                <Link
                  href="https://tiktok.com/@chrismongang"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 border border-zinc-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
                    <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
                    <path d="M15 8v8a4 4 0 0 1-4 4"></path>
                    <line x1="15" y1="4" x2="15" y2="12"></line>
                  </svg>
                  TikTok
                </Link>
                <Link
                  href="https://youtube.com/@chrismongang"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                  YouTube
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {players.map((player, index) => {
                // Berechne den Prozentsatz der Stimmen
                const percentage = totalVotes > 0 ? (player.votes / totalVotes) * 100 : 0;
                
                return (
                  <div 
                    key={player.id} 
                    className={`bg-zinc-900 border ${index === 0 ? 'border-yellow-500' : 'border-zinc-800'} rounded-lg p-4`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-zinc-800 rounded-full">
                        {index === 0 && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                        )}
                        {index === 1 && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                            <circle cx="12" cy="8" r="6"></circle>
                            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                          </svg>
                        )}
                        {index === 2 && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-700">
                            <circle cx="12" cy="8" r="6"></circle>
                            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                          </svg>
                        )}
                        {index > 2 && (
                          <span className="text-lg font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-medium">{player.name} <span className="text-zinc-500">#{player.player_number}</span></h3>
                          <span className="text-sm font-medium">{player.votes} {player.votes === 1 ? 'Stimme' : 'Stimmen'}</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-zinc-400' : index === 2 ? 'bg-amber-700' : 'bg-zinc-600'}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-center">
              <button
                onClick={handleShowFeedback}
                className="bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-lg font-medium transition"
              >
                Feedback geben & Social Media folgen
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}