'use client';

import { useState, useEffect } from 'react';
import { supabase, type Player } from '@/lib/supabase-client';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tokens, setTokens] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenCount, setTokenCount] = useState(10);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    player_number: '',
    image_url: '',
  });
  const [activeTab, setActiveTab] = useState('players');

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('players').select('*').order('player_number', { ascending: true });

      if (error) throw error;

      setPlayers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPlayer(e: React.FormEvent) {
    e.preventDefault();

    if (!newPlayer.name || !newPlayer.player_number) {
      setError('Name und Spielernummer sind erforderlich.');
      return;
    }

    try {
      const { error } = await supabase.from('players').insert([
        {
          name: newPlayer.name,
          player_number: Number.parseInt(newPlayer.player_number),
          image_url: newPlayer.image_url || null,
          votes: 0,
        },
      ]);

      if (error) throw error;

      setNewPlayer({ name: '', player_number: '', image_url: '' });
      loadPlayers();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDeletePlayer(id: string) {
    if (!confirm('Bist du sicher, dass du diesen Spieler löschen möchtest?')) {
      return;
    }

    try {
      const { error } = await supabase.from('players').delete().eq('id', id);

      if (error) throw error;

      loadPlayers();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function generateTokens() {
    try {
      setLoading(true);

      // Generiere zufällige Tokens
      const newTokens = Array.from({ length: tokenCount }, () => Math.random().toString(36).substring(2, 10));

      // Füge Tokens in die Datenbank ein
      const { error } = await supabase.from('users').insert(
        newTokens.map((token) => ({
          token,
          has_voted: false,
        })),
      );

      if (error) throw error;

      setTokens(newTokens);
      setActiveTab('tokens');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handlePrintTokens() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Bitte erlaube Pop-ups für diese Seite.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>1vs1 Voting Tokens</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .token-container { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              gap: 10px; 
              margin-bottom: 20px;
            }
            .token-card {
              border: 1px solid #ccc;
              padding: 10px;
              text-align: center;
              page-break-inside: avoid;
            }
            .token-value {
              font-size: 16px;
              font-weight: bold;
              margin: 10px 0;
            }
            .token-url {
              font-size: 12px;
              word-break: break-all;
            }
            @media print {
              @page { margin: 0.5cm; }
              body { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <h1>1vs1 Voting Tokens</h1>
          <p>Scanne den QR-Code oder besuche die URL, um abzustimmen.</p>
          <div class="token-container">
            ${tokens
              .map(
                (token) => `
              <div class="token-card">
                <div>1vs1 Nürnberg Voting</div>
                <div class="token-value">Token: ${token}</div>
                <div class="token-url">https://chrismongang.com/1vs1-events/voting?token=${token}</div>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://chrismongang.com/1vs1-events/voting?token=${token}" alt="QR Code" />
              </div>
            `,
              )
              .join('')}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">1vs1 Voting Admin</h1>
          <Link href="/1vs1-events" className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition">
            Zurück zu 1vs1 Events
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
            <p className="font-medium mb-1">Fehler</p>
            <p className="text-zinc-300">{error}</p>
            <button onClick={() => setError(null)} className="mt-2 text-sm text-zinc-400 hover:text-white">
              Schließen
            </button>
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden mb-8">
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => setActiveTab('players')}
              className={`px-4 py-3 ${activeTab === 'players' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              Spieler verwalten
            </button>
            <button
              onClick={() => setActiveTab('tokens')}
              className={`px-4 py-3 ${activeTab === 'tokens' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              Tokens generieren
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-4 py-3 ${activeTab === 'results' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              Ergebnisse
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'players' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Spieler hinzufügen</h2>
                <form onSubmit={handleAddPlayer} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={newPlayer.name}
                      onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      placeholder="Max Mustermann"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Spielernummer</label>
                    <input
                      type="number"
                      value={newPlayer.player_number}
                      onChange={(e) => setNewPlayer({ ...newPlayer, player_number: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Bild-URL (optional)</label>
                    <input
                      type="text"
                      value={newPlayer.image_url}
                      onChange={(e) => setNewPlayer({ ...newPlayer, image_url: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      Spieler hinzufügen
                    </button>
                  </div>
                </form>

                <h2 className="text-xl font-bold mb-4">Spielerliste</h2>
                {loading ? (
                  <p>Lade Spieler...</p>
                ) : players.length === 0 ? (
                  <p className="text-zinc-400">Keine Spieler gefunden. Füge oben Spieler hinzu.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {players.map((player) => (
                      <div key={player.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{player.name}</h3>
                            <p className="text-zinc-400">#{player.player_number}</p>
                          </div>
                          <button
                            onClick={() => handleDeletePlayer(player.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            Löschen
                          </button>
                        </div>
                        {player.image_url && (
                          <div className="mt-2 h-20 relative">
                            <Image
                              src={player.image_url || "/placeholder.svg"}
                              alt={player.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tokens' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Tokens generieren</h2>
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-6">
                  <p className="mb-4">
                    Generiere einmalige Tokens für die Abstimmung. Jeder Token kann nur einmal verwendet werden.
                  </p>
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Anzahl der Tokens</label>
                      <input
                        type="number"
                        value={tokenCount}
                        onChange={(e) => setTokenCount(Number.parseInt(e.target.value))}
                        min="1"
                        max="100"
                        className="w-24 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <button
                      onClick={generateTokens}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition mt-6"
                    >
                      {loading ? 'Generiere...' : 'Tokens generieren'}
                    </button>
                  </div>
                </div>

                {tokens.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Generierte Tokens ({tokens.length})</h3>
                      <button
                        onClick={handlePrintTokens}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                      >
                        QR-Codes drucken
                      </button>
                    </div>
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <ul className="space-y-2">
                        {tokens.map((token, index) => (
                          <li key={index} className="flex justify-between items-center">
                            <span>{token}</span>
                            <span className="text-zinc-400">
                              https://chrismongang.com/1vs1-events/voting?token={token}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'results' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Abstimmungsergebnisse</h2>
                {loading ? (
                  <p>Lade Ergebnisse...</p>
                ) : players.length === 0 ? (
                  <p className="text-zinc-400">Keine Spieler gefunden.</p>
                ) : (
                  <div className="space-y-4">
                    {[...players]
                      .sort((a, b) => b.votes - a.votes)
                      .map((player, index) => (
                        <div
                          key={player.id}
                          className={`bg-zinc-800 border ${index === 0 ? 'border-yellow-500' : 'border-zinc-700'} rounded-lg p-4`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-zinc-700 rounded-full">
                              <span className="text-lg font-bold">{index + 1}</span>
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between items-center">
                                <h3 className="font-medium">
                                  {player.name} <span className="text-zinc-500">#{player.player_number}</span>
                                </h3>
                                <span className="text-lg font-bold">
                                  {player.votes} {player.votes === 1 ? 'Stimme' : 'Stimmen'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}