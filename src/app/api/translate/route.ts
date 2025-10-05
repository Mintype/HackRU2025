import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { word, sourceLang, targetLang } = await request.json();

    if (!word || !sourceLang || !targetLang) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Use a translation API (e.g., Google Translate, DeepL, or LibreTranslate)
    // For now, using a simple mock translation
    // You should replace this with an actual translation API
    
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(word)}`
    );

    if (!response.ok) {
      throw new Error('Translation API error');
    }

    const data = await response.json();
    const translation = data[0]?.[0]?.[0] || 'Translation not available';

    return NextResponse.json({ translation });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed', translation: 'Translation unavailable' },
      { status: 500 }
    );
  }
}
