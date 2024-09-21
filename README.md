# use-audio-recording

Use Audio Recording

## Installation

To install the package, use npm:

```bash
pnpm add use-audio-recording

yarn install use-audio-recording

npm install use-audio-recording
```

## Usage

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
        isPaused
    } = useAudioRecording();

    const [audioSrc, setAudioSrc] = useState<string | null>(null);

    const handleComplete = async () => {
        const audioUrl = await completeRecording();
        setAudioSrc(audioUrl);
    };

    return (
        <div>
            <h2>Audio Recorder</h2>
            <button onClick={startRecording} disabled={isRecording}>
                Start Recording
            </button>
            <button onClick={pauseRecording} disabled={!isRecording || isPaused}>
                Pause
            </button>
            <button onClick={resumeRecording} disabled={!isRecording || !isPaused}>
                Resume
            </button>
            <button onClick={stopRecording} disabled={!isRecording}>
                Stop
            </button>
            <button onClick={handleComplete}>
                Complete
            </button>

            {audioSrc && (
                <div>
                    <h3>Recorded Audio:</h3>
                    <audio controls src={audioSrc}></audio>
                </div>
            )}
        </div>
    );
};

export default AudioRecorder;
```

## tsup
Bundle your TypeScript library with no config, powered by esbuild.

https://tsup.egoist.dev/

## How to use this
1. install dependencies
```
# pnpm
$ pnpm install

# yarn
$ yarn install

# npm
$ npm install
```
2. Add your code to `src`
3. Add export statement to `src/index.ts`
4. Test build command to build `src`.
Once the command works properly, you will see `dist` folder.

```zsh
# pnpm
$ pnpm run build

# yarn
$ yarn run build

# npm
$ npm run build
```
5. Publish your package

```zsh
$ npm publish
```


## test package
https://www.npmjs.com/package/use-audio-recording
