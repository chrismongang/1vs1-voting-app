import { createClient } from '@supabase/supabase-js';

// Diese Umgebungsvariablen müssen in deiner .env.local Datei definiert sein
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Hier erstellen wir den Supabase-Client, den wir in der gesamten App verwenden
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Typdefinitionen für unsere Datenbanktabellen
export type Player = {
  id: string;
  name: string;
  player_number: number;
  image_url: string | null;
  votes: number;
  created_at: string;
};

export type User = {
  id: string;
  token: string;
  has_voted: boolean;
  voted_for: string | null;
  created_at: string;
};

export type Vote = {
  id: string;
  user_id: string;
  player_id: string;
  created_at: string;
};

// Funktion zum Überprüfen, ob ein Token gültig ist
export async function validateToken(token: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('token', token)
    .single();
  
  if (error) {
    return { valid: false, user: null, error: error.message };
  }
  
  return { valid: true, user: data as User, error: null };
}

// Funktion zum Abrufen aller Spieler
export async function getPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('player_number', { ascending: true });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data as Player[];
}

// Funktion zum Abstimmen für einen Spieler
export async function voteForPlayer(userId: string, playerId: string) {
  // Zuerst prüfen, ob der Benutzer bereits abgestimmt hat
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('has_voted')
    .eq('id', userId)
    .single();
  
  if (userError) {
    throw new Error(userError.message);
  }
  
  if (user.has_voted) {
    throw new Error('Du hast bereits abgestimmt.');
  }
  
  // Transaktion starten: Stimme speichern und Benutzer aktualisieren
  const { error: voteError } = await supabase
    .from('votes')
    .insert([{ user_id: userId, player_id: playerId }]);
  
  if (voteError) {
    throw new Error(voteError.message);
  }
  
  // Benutzer als "hat abgestimmt" markieren
  const { error: updateUserError } = await supabase
    .from('users')
    .update({ has_voted: true, voted_for: playerId })
    .eq('id', userId);
  
  if (updateUserError) {
    throw new Error(updateUserError.message);
  }
  
  // Spieler-Stimmen erhöhen
  const { error: updatePlayerError } = await supabase
    .from('players')
    .update({ votes: supabase.rpc('increment', { x: 1 }) })
    .eq('id', playerId);
  
  if (updatePlayerError) {
    throw new Error(updatePlayerError.message);
  }
  
  return { success: true };
}

// Funktion zum Abrufen der Ergebnisse in Echtzeit
export function subscribeToResults(callback: (players: Player[]) => void) {
  // Abonniere Änderungen an der players-Tabelle
  const subscription = supabase
    .channel('players-channel')
    .on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'players' }, 
      async () => {
        // Bei Änderungen alle Spieler neu laden
        const players = await getPlayers();
        callback(players);
      }
    )
    .subscribe();
  
  // Funktion zum Aufheben des Abonnements zurückgeben
  return () => {
    supabase.removeChannel(subscription);
  };
}