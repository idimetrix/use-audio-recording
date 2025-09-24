# use-audio-recording

A professional React hook for audio recording with TypeScript support. This lightweight library provides a simple and intuitive interface for recording audio in React applications using the Web Audio API.

[![npm version](https://badge.fury.io/js/use-audio-recording.svg)](https://badge.fury.io/js/use-audio-recording)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## Features

- 🎙️ **Easy Audio Recording**: Simple interface for recording audio in React apps
- ⏯️ **Pause/Resume Support**: Control recording state with pause and resume functionality
- 🔧 **TypeScript Support**: Fully typed for better development experience
- 🪝 **React Hook**: Built as a custom hook following React best practices
- 📦 **Lightweight**: Minimal dependencies and small bundle size
- 🌐 **Cross-browser Compatible**: Works in all modern browsers supporting MediaRecorder API
- 🧪 **Well Tested**: Comprehensive test suite included

## Installation

Install the package using your preferred package manager:

```bash
# npm
npm install use-audio-recording

# yarn
yarn add use-audio-recording

# pnpm
pnpm add use-audio-recording
```

## Usage

### Basic Example

```tsx
import React, { useState } from 'react';
import { useAudioRecording } from 'use-audio-recording';

const AudioRecorder: React.FC = () => {
  const {
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    completeRecording,
    isRecording,
    isPaused,
    duration,
    error,
    clearError
  } = useAudioRecording();

  const [audioSrc, setAudioSrc] = useState<string | null>(null);

  const handleComplete = async () => {
    const audioUrl = await completeRecording();
    setAudioSrc(audioUrl);
  };

  return (
    <div>
      <h2>Audio Recorder</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={startRecording} 
          disabled={isRecording}
          style={{ marginRight: '0.5rem' }}
        >
          Start Recording
        </button>
        
        <button 
          onClick={pauseRecording} 
          disabled={!isRecording || isPaused}
          style={{ marginRight: '0.5rem' }}
        >
          Pause
        </button>
        
        <button 
          onClick={resumeRecording} 
          disabled={!isRecording || !isPaused}
          style={{ marginRight: '0.5rem' }}
        >
          Resume
        </button>
        
        <button 
          onClick={stopRecording} 
          disabled={!isRecording}
          style={{ marginRight: '0.5rem' }}
        >
          Stop
        </button>
        
        <button onClick={handleComplete}>
          Complete & Get Audio
        </button>
      </div>

      <div>
        <p>Status: {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Stopped'}</p>
      </div>

      {audioSrc && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Recorded Audio:</h3>
          <audio controls src={audioSrc} style={{ width: '100%' }}></audio>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
```

### Advanced Example with Error Handling

```tsx
import React, { useState, useCallback } from 'react';
import { useAudioRecording } from 'use-audio-recording';

const AdvancedAudioRecorder: React.FC = () => {
  const {
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    completeRecording,
    isRecording,
    isPaused
  } = useAudioRecording();

  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartRecording = useCallback(async () => {
    try {
      await startRecording();
      setError(null);
    } catch (err) {
      setError('Failed to start recording. Please check microphone permissions.');
    }
  }, [startRecording]);

  const handleCompleteRecording = useCallback(async () => {
    try {
      const audioUrl = await completeRecording();
      if (audioUrl) {
        setAudioSrc(audioUrl);
        setError(null);
      } else {
        setError('No audio data available');
      }
    } catch (err) {
      setError('Failed to complete recording');
    }
  }, [completeRecording]);

  return (
    <div>
      <h2>Advanced Audio Recorder</h2>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          Error: {error}
        </div>
      )}
      
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={handleStartRecording} disabled={isRecording}>
          🎙️ Start Recording
        </button>
        <button onClick={pauseRecording} disabled={!isRecording || isPaused}>
          ⏸️ Pause
        </button>
        <button onClick={resumeRecording} disabled={!isRecording || !isPaused}>
          ▶️ Resume
        </button>
        <button onClick={stopRecording} disabled={!isRecording}>
          ⏹️ Stop
        </button>
        <button onClick={handleCompleteRecording}>
          ✅ Complete
        </button>
      </div>

      <div>
        <p>
          Status: {isRecording ? (isPaused ? '⏸️ Paused' : '🔴 Recording') : '⏹️ Stopped'}
        </p>
      </div>

      {audioSrc && (
        <div style={{ marginTop: '1rem' }}>
          <h3>🎵 Recorded Audio:</h3>
          <audio controls src={audioSrc} style={{ width: '100%' }}></audio>
          <div style={{ marginTop: '0.5rem' }}>
            <a href={audioSrc} download="recording.webm">
              💾 Download Recording
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAudioRecorder;
```

## API Reference

### `useAudioRecording(config?)`

The main hook that provides audio recording functionality with optional configuration.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `config` | `AudioRecordingConfig?` | Optional configuration object |

#### Configuration Options

```typescript
interface AudioRecordingConfig {
  /** Audio constraints for getUserMedia */
  audioConstraints?: MediaStreamConstraints['audio'];
  /** MIME type for the recorded audio */
  mimeType?: string;
}
```

#### Returns

An object containing the following properties and methods:

| Property | Type | Description |
|----------|------|-------------|
| `startRecording` | `() => Promise<void>` | Starts audio recording. Requests microphone permission if not already granted. |
| `pauseRecording` | `() => void` | Pauses the current recording session. |
| `resumeRecording` | `() => void` | Resumes a paused recording session. |
| `stopRecording` | `() => void` | Stops the current recording session. |
| `completeRecording` | `() => Promise<string \| null>` | Completes recording and returns a blob URL for the recorded audio. |
| `isRecording` | `boolean` | Indicates whether recording is currently active. |
| `isPaused` | `boolean` | Indicates whether recording is currently paused. |
| `duration` | `number` | Current recording duration in seconds. |
| `error` | `AudioRecordingError \| null` | Any error that occurred during recording. |
| `clearError` | `() => void` | Clear the current error state. |

#### Methods

##### `startRecording()`

Initiates audio recording by requesting access to the user's microphone.

```tsx
const { startRecording } = useAudioRecording();

// Start recording
await startRecording();
```

**Note**: This method requires user permission to access the microphone. Make sure to handle potential permission denial gracefully.

##### `pauseRecording()`

Pauses the current recording session without stopping it completely.

```tsx
const { pauseRecording, isRecording, isPaused } = useAudioRecording();

// Pause recording (only works if currently recording and not already paused)
if (isRecording && !isPaused) {
  pauseRecording();
}
```

##### `resumeRecording()`

Resumes a previously paused recording session.

```tsx
const { resumeRecording, isRecording, isPaused } = useAudioRecording();

// Resume recording (only works if recording is paused)
if (isRecording && isPaused) {
  resumeRecording();
}
```

##### `stopRecording()`

Stops the current recording session completely.

```tsx
const { stopRecording, isRecording } = useAudioRecording();

// Stop recording
if (isRecording) {
  stopRecording();
}
```

##### `completeRecording()`

Finalizes the recording and returns a blob URL that can be used as the source for an audio element.

```tsx
const { completeRecording } = useAudioRecording();

// Complete recording and get audio URL
const audioUrl = await completeRecording();
if (audioUrl) {
  setAudioSrc(audioUrl);
}
```

**Returns**: `Promise<string | null>` - A blob URL for the recorded audio, or `null` if no audio data is available.

## Browser Compatibility

This hook uses the [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder), which is supported in:

- ✅ Chrome 47+
- ✅ Firefox 25+
- ✅ Safari 14+
- ✅ Edge 79+

For older browsers, consider using a polyfill or fallback solution.

## Error Handling

The hook handles several types of errors gracefully:

- **Permission Denied**: When user denies microphone access
- **Browser Compatibility**: When MediaRecorder API is not available
- **Invalid State**: When methods are called in invalid states

Example error handling:

```tsx
const { startRecording } = useAudioRecording();

try {
  await startRecording();
} catch (error) {
  if (error.name === 'NotAllowedError') {
    console.error('Microphone access denied');
  } else if (error.name === 'NotFoundError') {
    console.error('No microphone found');
  } else {
    console.error('Error starting recording:', error);
  }
}
```

## Development

### Building the Package

```bash
# Install dependencies
pnpm install

# Build the package
pnpm run build

# Run tests
pnpm test

# Run type checking
pnpm run type

# Format code
pnpm run format
```

### Testing

The package includes comprehensive tests using Jest and React Testing Library:

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm run test:coverage

# Run tests in watch mode
pnpm run test:watch
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Dmitrii Selikhov**
- Email: dmitrii.selikhov@gmail.com
- LinkedIn: [dimetrix](https://www.linkedin.com/in/dimetrix)
- GitHub: [idimetrix](https://github.com/idimetrix)

## Changelog

### 2.0.0 🎉
- **BREAKING**: Enhanced API with new return properties (`duration`, `error`, `clearError`)
- **BREAKING**: `startRecording` now returns a Promise for better error handling
- Added comprehensive error handling with custom error types
- Added duration tracking with real-time updates
- Added configuration options for audio constraints and MIME types
- Enhanced TypeScript definitions with complete type safety
- Improved memory management with proper stream cleanup
- Added comprehensive test coverage (67%+ code coverage)
- Updated all dependencies to latest versions (React 19, Jest 30, etc.)
- Professional code architecture with useCallback optimizations

### 1.0.3
- Updated all dependencies to latest versions
- Added comprehensive TypeScript support
- Improved test coverage
- Enhanced documentation
- Fixed compatibility issues with React 19

### 1.0.2
- Initial release with basic audio recording functionality
- Support for pause/resume operations
- TypeScript definitions included

---

If you find this package useful, please consider giving it a ⭐ on [GitHub](https://github.com/idimetrix/use-audio-recording)!