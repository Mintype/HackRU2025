import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { messages, language } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
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

    // Create the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    // Build the conversation history
    const conversationHistory = messages
      .map((msg: { role: string; content: string }) => {
        return `${msg.role === 'user' ? 'Student' : 'Teacher'}: ${msg.content}`;
      })
      .join('\n\n');

    // Create the prompt
    const prompt = `You are a helpful and encouraging ${languageName} language teacher. Your goal is to help the student practice ${languageName} through natural conversation.

Guidelines:
- Respond primarily in ${languageName} when conversing with the user
- When asked to provide explanations you can provide explanations in parentheses in the user's native language
- Keep your responses conversational and appropriate for language learners
- Gently correct mistakes by naturally using the correct form in your response
- Ask follow-up questions to keep the conversation flowing
- Adjust your language complexity based on the student's level
- Be supportive and encouraging
- If the student makes a grammar or vocabulary mistake, provide brief, helpful corrections in the user's native language
- If asked what a word or phrase means, provide a simple definition of said word or phrase in the user's native language

Previous conversation:
${conversationHistory}

Respond to the student's last message naturally as their ${languageName} teacher.`;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ message: text });
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
}
