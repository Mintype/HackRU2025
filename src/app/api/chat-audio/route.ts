import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { audioData, language, conversationHistory } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    if (!audioData) {
      return NextResponse.json(
        { error: 'No audio data provided' },
        { status: 400 }
      );
    }

    // Get language name
    const languageNames: { [key: string]: string } = {
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      ja: 'Japanese',
      zh: 'Chinese',
      ko: 'Korean',
      it: 'Italian',
      pt: 'Portuguese',
      ru: 'Russian',
      ar: 'Arabic',
      hi: 'Hindi',
      nl: 'Dutch',
    };

    const languageName = languageNames[language] || language;

    // Use Gemini 1.5 Pro which supports audio input
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build conversation context if available
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = '\n\nPrevious conversation:\n' + 
        conversationHistory
          .slice(-5) // Last 5 messages for context
          .map((msg: { role: string; content: string }) => 
            `${msg.role === 'user' ? 'Student' : 'Teacher'}: ${msg.content}`
          )
          .join('\n');
    }

    // Create prompt for audio processing
    const prompt = `You are a helpful and encouraging ${languageName} language teacher. A student is practicing ${languageName} with you through voice messages.

Listen to this audio message and:
1. First, transcribe what the student said (write it exactly as they said it in ${languageName})
2. Then respond naturally to continue the conversation

Guidelines:
- Respond in ${languageName} when conversing with the user
- Keep your responses conversational and appropriate for language learners
- Keep responses brief but appropriate length for the conversation and student's level
- Ask follow-up questions in ${languageName} to keep the conversation flowing
- Adjust your language complexity based on the student's level
- Be supportive and encouraging
- If the student makes a grammar or vocabulary mistake, provide brief, helpful corrections in English after your ${languageName} response
- Focus on natural conversation flow

${conversationContext}

Please format your response as:
TRANSCRIPTION: [what the student said in ${languageName}]
RESPONSE: [your response in ${languageName}]`;

    try {
      const result = await model.generateContent([
        {
          text: prompt
        },
        {
          inlineData: {
            mimeType: 'audio/webm',
            data: audioData
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();

      // Parse the response to extract transcription and response
      let transcription = '[Voice message]';
      let message = text;

      // Try to extract TRANSCRIPTION and RESPONSE from formatted output
      const transcriptionMatch = text.match(/TRANSCRIPTION:\s*(.+?)(?=RESPONSE:|$)/i);
      const responseMatch = text.match(/RESPONSE:\s*(.+)/i);

      if (transcriptionMatch && responseMatch) {
        transcription = transcriptionMatch[1].trim();
        message = responseMatch[1].trim();
      } else {
        // If format not found, use the whole response
        // Try to extract anything that looks like a transcription at the start
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length > 1) {
          // Assume first line might be transcription, rest is response
          transcription = lines[0].replace(/^(TRANSCRIPTION:|transcription:)/i, '').trim();
          message = lines.slice(1).join('\n').replace(/^(RESPONSE:|response:)/i, '').trim();
        }
      }

      return NextResponse.json({ 
        message: message,
        transcription: transcription,
        success: true
      });

    } catch (audioError: unknown) {
      console.error('Error processing audio with Gemini:', audioError);
      
      return NextResponse.json(
        { 
          error: 'Failed to process audio. Please try again or use text chat.',
          details: audioError instanceof Error ? audioError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Error in audio chat API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process audio message' },
      { status: 500 }
    );
  }
}
