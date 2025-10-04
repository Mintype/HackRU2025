import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient({
  apiKey: 'sk_83fc3fec7991d1967e08ee96f21be8c7fe7a164233638972',
});

export async function textToSpeech(text: string): Promise<Blob> {
  try {
    const audioStream = await elevenlabs.textToSpeech.stream('JBFqnCBsd6RMkjVDRZzb', {
      text,
      modelId: 'eleven_multilingual_v2',
    });

    // Convert stream to blob
    const chunks: Uint8Array[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    
    return new Blob(chunks, { type: 'audio/mpeg' });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw error;
  }
}