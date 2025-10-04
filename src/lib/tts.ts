import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient({
  apiKey: 'sk_83fc3fec7991d1967e08ee96f21be8c7fe7a164233638972',
});

export async function playStreamingAudio(text: string, onStart?: () => void, onEnd?: () => void) {
  try {
    onStart?.();

    const audioStream = await elevenlabs.textToSpeech.stream('JBFqnCBsd6RMkjVDRZzb', {
      text,
      modelId: 'eleven_multilingual_v2',
    });

    const reader = audioStream.getReader();
    const audioContext = new AudioContext();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      if (value) {
        const audioBuffer = await audioContext.decodeAudioData(value.buffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
        await new Promise(resolve => source.onended = resolve);
      }
    }

    onEnd?.();
  } catch (error) {
    console.error('Error playing streaming audio:', error);
    onEnd?.();
    throw error;
  }
}