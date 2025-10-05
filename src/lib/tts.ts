import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY!,
});

let currentAudioContext: AudioContext | null = null;
let currentSources: AudioBufferSourceNode[] = [];
let isPlaying = false;
let lastPlayedMessage = '';
let lastPlayedTimestamp = 0;

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
  // Prevent duplicate plays within 1 second and for the same message
  const now = Date.now();
  if (text === lastPlayedMessage && now - lastPlayedTimestamp < 1000) {
    return;
  }

  // Update tracking
  lastPlayedMessage = text;
  lastPlayedTimestamp = now;

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
      modelId: 'eleven_v3',
    });

    const reader = audioStream.getReader();
    currentAudioContext = new AudioContext();
    
    // Collect all audio chunks first
    const audioChunks: Uint8Array[] = [];
    
    while (isPlaying) {
      const { done, value } = await reader.read();
      if (done) break;
      
      if (value && isPlaying) {
        audioChunks.push(new Uint8Array(value.buffer));
      }
    }

    if (!isPlaying) {
      reader.cancel();
      onEnd?.();
      return;
    }

    // Concatenate all chunks into one buffer
    const totalLength = audioChunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const completeAudio = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of audioChunks) {
      completeAudio.set(chunk, offset);
      offset += chunk.length;
    }

    // Decode and play the complete audio
    if (isPlaying) {
      const audioBuffer = await currentAudioContext.decodeAudioData(completeAudio.buffer);
      const source = currentAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(currentAudioContext.destination);
      currentSources.push(source);
      
      source.onended = () => {
        const index = currentSources.indexOf(source);
        if (index > -1) {
          currentSources.splice(index, 1);
        }
        onEnd?.();
      };

      source.start(0);
    } else {
      onEnd?.();
    }
  } catch (error) {
    console.error('Error playing streaming audio:', error);
    onEnd?.();
    throw error;
  } finally {
    if (currentSources.length === 0) {
      isPlaying = false;
    }
  }
}