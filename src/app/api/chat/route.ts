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

    // Create the model for text chat
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
- Respond in ${languageName} when conversing with the user. Use English when explaining statements or incorrect grammar
- If the user explicitly asks for the meaning or translation of a phrase, respond in English, then continue and encourage the user to use ${languageName}
- This next part is very important: take note. If the user asks any general questions to you in English, respond in English but encourage them to respond in ${languageName}
- Any feedback provided will be in English but follow up responses to the conversation will be in ${languageName}
- Try to have more chats than feedback but still provide feedback when necessary
- Keep your responses conversational and appropriate for language learners
- Keep responses brief but apppropriate length for the conversation and student's level
- Ask follow-up questions in ${languageName} to keep the conversation flowing
- Adjust your language complexity based on the student's level
- Be supportive and encouraging while asking the student to respond in ${languageName}
- If the student makes a grammar or vocabulary mistake, provide brief, helpful corrections in English
- If asked what a word or phrase means, provide a simple definition of said word or phrase in English

Previous conversation:
${conversationHistory}

Respond to the student's last message naturally as their ${languageName} teacher.`;

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ message: text });
  } catch (error: unknown) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate response' },
      { status: 500 }
    );
  }
}
