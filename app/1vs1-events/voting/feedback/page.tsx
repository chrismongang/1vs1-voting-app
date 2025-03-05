'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function FeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  
  // Wenn kein Token vorhanden ist, zur Landing Page zurückleiten
  useEffect(() => {
    if (!token) {
      router.push('/1vs1-events/voting');
    }
  }, [token, router]);
  
  // Wenn das Typeform-Formular abgeschlossen wurde, zeige die Social-Media-Links an
  function handleTypeformSubmit() {
    setShowSocialLinks(true);
  }
  
  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Dein Feedback ist uns wichtig!</h1>
        
        {!showSocialLinks ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <iframe
              id="typeform-embed"
              src="https://form.typeform.com/to/your-typeform-id-here?typeform-medium=embed-snippet"
              style={{ width: '100%', height: '500px', border: 'none' }}
              allow="camera; microphone; autoplay; encrypted-media;"
              onLoad={() => {
                // Hier könnten wir einen Event-Listener für das Typeform-Formular hinzufügen,
                // um zu erkennen, wann es abgeschlossen wurde
                // Für dieses Beispiel verwenden wir einen einfachen Button
              }}
            ></iframe>
            
            {/* Temporärer Button für die Demo */}
            <div className="text-center mt-4">
              <button
                onClick={handleTypeformSubmit}
                className="bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-lg font-medium transition"
              >
                Feedback abschließen und Social Media folgen
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Vielen Dank für dein Feedback!</h2>
            <p className="text-zinc-400 mb-8">
              Folge Chris Mongang auf Social Media, um keine Events mehr zu verpassen!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Link
                href="https://instagram.com/chrismongang"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg flex flex-col items-center gap-2 hover:opacity-90 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <span className="font-medium">Instagram</span>
                <span className="text-sm">@chrismongang</span>
              </Link>
              
              <Link
                href="https://tiktok.com/@chrismongang"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white p-4 rounded-lg flex flex-col items-center gap-2 border border-zinc-700 hover:border-zinc-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
                  <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
                  <path d="M15 8v8a4 4 0 0 1-4 4"></path>
                  <line x1="15" y1="4" x2="15" y2="12"></line>
                </svg>
                <span className="font-medium">TikTok</span>
                <span className="text-sm">@chrismongang</span>
              </Link>
              
              <Link
                href="https://youtube.com/@chrismongang"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 text-white p-4 rounded-lg flex flex-col items-center gap-2 hover:bg-red-700 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
                <span className="font-medium">YouTube</span>
                <span className="text-sm">@chrismongang</span>
              </Link>
            </div>
            
            <Link
              href="/1vs1-events"
              className="inline-block bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg transition"
            >
              Zurück zu 1vs1 Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}