import { type NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  try {
    // Generiere die URL für den QR-Code
    const url = `https://chrismongang.com/1vs1-events/voting?token=${token}`;

    // Generiere den QR-Code als Data-URL
    const qrCodeDataUrl = await QRCode.toDataURL(url);

    // Gib den QR-Code als Bild zurück
    return new NextResponse(qrCodeDataUrl, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}