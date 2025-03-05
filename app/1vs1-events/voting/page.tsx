'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { validateToken } from '@/lib/supabase-client';
import Link from 'next/link';

export default function VotingLandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Wenn ein Token in der URL vorhanden ist, validiere es
    if (token) {
      validateTokenAndRedirect();
    }
  }, [token]);
  
  async function validateTokenAndRedirect() {
    setIsValidating(true);
    setError(null);
    
    try {
      const { valid, user, error } = await validateToken(token!);
      
      if (!valid) {
        setError(error || 'Ungültiger Token. Bitte scanne den QR-Code erneut.');
        setIsValidating(false);
        return;
      }
      
      if (user.has_voted) {
        // Wenn der Benutzer bereits abgestimmt hat, leite ihn zur Ergebnisseite weiter
        router.push(`/1vs1-events/voting/results?token=${token}`);
      } else {
        // Wenn der Token gültig ist und der Benutzer noch nicht abgestimmt hat,
        // leite ihn zur Abstimmungsseite weiter
        router.push(`/1vs1-events/voting/vote?token=${token}`);
      }
    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
      setIsValidating(false);
    }
  }
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">1vs1 Nürnberg - Voting</h1>
        
        {!token ? (
          <>
            <p className="text-lg mb-8">
              Willkommen beim 1vs1 Voting! Scanne den QR-Code, um für deinen Lieblingsspieler abzustimmen.
            </p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
              <p className="text-zinc-400 mb-4">
                Du hast keinen QR-Code? Bitte wende dich an einen Mitarbeiter vor Ort.
              </p>
            </div>
            <Link 
              href="/1vs1-events"
              className="inline-block bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg transition"
            >
              Zurück zu 1vs1 Events
            </Link>
          </>
        ) : (
          <>
            {isValidating ? (
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-t-2 border-white rounded-full animate-spin mb-4"></div>
                <p>Überprüfe Token...</p>
              </div>
            ) : error ? (
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
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-t-2 border-white rounded-full animate-spin mb-4"></div>
                <p>Leite weiter...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}