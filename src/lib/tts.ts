import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY!,
});

let currentAudioContext: AudioContext | null = null;
let currentSources: AudioBufferSourceNode[] = [];
let isPlaying = false;

export function stopAudio() {
  if (currentAudioContext) {
    currentSources.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Ignore errors if source already stopped
      }
    });
    currentSources = [];
    currentAudioContext.close();
    currentAudioContext = null;
    isPlaying = false;
  }
}

export async function playStreamingAudio(text: string, onStart?: () => void, onEnd?: () => void) {
  // If already playing, stop first and wait a small delay to ensure cleanup
  if (isPlaying) {
    stopAudio();
    // Small delay to ensure audio context is properly closed
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  try {
    isPlaying = true;
    onStart?.();

    const audioStream = await elevenlabs.textToSpeech.stream('JBFqnCBsd6RMkjVDRZzb', {
      text,
      modelId: 'eleven_multilingual_v2',
    });

    const reader = audioStream.getReader();
    currentAudioContext = new AudioContext();
    
    while (isPlaying) {
      const { done, value } = await reader.read();
      if (done) break;
      
      if (value && isPlaying) {
        // Create a copy of the buffer to ensure it's an ArrayBuffer
        const buffer = new Uint8Array(value.buffer).buffer as ArrayBuffer;
        const audioBuffer = await currentAudioContext.decodeAudioData(buffer);
        const source = currentAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(currentAudioContext.destination);
        currentSources.push(source);
        
        source.onended = () => {
          const index = currentSources.indexOf(source);
          if (index > -1) {
            currentSources.splice(index, 1);
          }
        };

        source.start(0);
        await new Promise(resolve => source.onended = resolve);
      }
    }

    if (!isPlaying) {
      reader.cancel();
    }

    onEnd?.();
  } catch (error) {
    console.error('Error playing streaming audio:', error);
    onEnd?.();
    throw error;
  } finally {
    isPlaying = false;
  }
}