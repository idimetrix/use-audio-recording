import { useState, useRef, useCallback } from "react";

/**
 * Audio recording error types
 */
export interface AudioRecordingError extends Error {
  name: 'NotAllowedError' | 'NotFoundError' | 'NotSupportedError' | 'AudioRecordingError';
  message: string;
}

/**
 * Configuration options for audio recording
 */
export interface AudioRecordingConfig {
  /** Audio constraints for getUserMedia */
  audioConstraints?: MediaStreamConstraints['audio'];
  /** MIME type for the recorded audio */
  mimeType?: string;
}

/**
 * Return type for the useAudioRecording hook
 */
export interface UseAudioRecording {
  /** Start recording audio */
  startRecording: () => Promise<void>;
  /** Pause the current recording */
  pauseRecording: () => void;
  /** Resume a paused recording */
  resumeRecording: () => void;
  /** Stop the current recording */
  stopRecording: () => void;
  /** Complete recording and get the audio URL */
  completeRecording: () => Promise<string | null>;
  /** Whether recording is currently active */
  isRecording: boolean;
  /** Whether recording is currently paused */
  isPaused: boolean;
  /** Current recording duration in seconds */
  duration: number;
  /** Any error that occurred during recording */
  error: AudioRecordingError | null;
  /** Clear the current error */
  clearError: () => void;
}

/**
 * A professional React hook for audio recording with comprehensive error handling and TypeScript support
 * 
 * @param config - Optional configuration for audio recording
 * @returns Audio recording state and control functions
 */
export const useAudioRecording = (config: AudioRecordingConfig = {}): UseAudioRecording => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<AudioRecordingError | null>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number>(0);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const stopDurationTimer = useCallback(() => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
  }, []);

  const startDurationTimer = useCallback(() => {
    startTime.current = Date.now();
    durationInterval.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
  }, []);

  const createAudioRecordingError = useCallback((originalError: unknown, context: string): AudioRecordingError => {
    if (originalError instanceof DOMException) {
      const error = new Error(`${context}: ${originalError.message}`) as AudioRecordingError;
      error.name = originalError.name as AudioRecordingError['name'];
      return error;
    }
    
    const error = new Error(`${context}: ${String(originalError)}`) as AudioRecordingError;
    error.name = 'AudioRecordingError';
    return error;
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    if (isRecording) {
      return;
    }

    // Check for browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const error = new Error('MediaRecorder API is not supported in this browser') as AudioRecordingError;
      error.name = 'NotSupportedError';
      setError(error);
      throw error;
    }

    if (!window.MediaRecorder) {
      const error = new Error('MediaRecorder is not supported in this browser') as AudioRecordingError;
      error.name = 'NotSupportedError';
      setError(error);
      throw error;
    }

    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: config.audioConstraints ?? true,
      });
      
      streamRef.current = stream;
      audioChunks.current = [];
      setDuration(0);

      // Determine the best MIME type
      const mimeType = config.mimeType ?? (
        MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' :
        MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' :
        MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' :
        undefined
      );

      const options = mimeType ? { mimeType } : undefined;
      mediaRecorder.current = new MediaRecorder(stream, options);

      mediaRecorder.current.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        setIsRecording(false);
        setIsPaused(false);
        stopDurationTimer();
        
        // Clean up the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.current.onerror = (event) => {
        const error = createAudioRecordingError(event, 'MediaRecorder error');
        setError(error);
        setIsRecording(false);
        setIsPaused(false);
        stopDurationTimer();
      };

      mediaRecorder.current.start(1000); // Collect data every second
      setIsRecording(true);
      startDurationTimer();
    } catch (originalError) {
      const error = createAudioRecordingError(originalError, 'Failed to start recording');
      setError(error);
      throw error;
    }
  }, [isRecording, config.audioConstraints, config.mimeType, createAudioRecordingError, startDurationTimer, stopDurationTimer]);

  const pauseRecording = useCallback((): void => {
    if (isRecording && !isPaused && mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      try {
        mediaRecorder.current.pause();
        setIsPaused(true);
        stopDurationTimer();
        setError(null);
      } catch (originalError) {
        const error = createAudioRecordingError(originalError, 'Failed to pause recording');
        setError(error);
      }
    }
  }, [isRecording, isPaused, createAudioRecordingError, stopDurationTimer]);

  const resumeRecording = useCallback((): void => {
    if (isRecording && isPaused && mediaRecorder.current && mediaRecorder.current.state === 'paused') {
      try {
        mediaRecorder.current.resume();
        setIsPaused(false);
        startDurationTimer();
        setError(null);
      } catch (originalError) {
        const error = createAudioRecordingError(originalError, 'Failed to resume recording');
        setError(error);
      }
    }
  }, [isRecording, isPaused, createAudioRecordingError, startDurationTimer]);

  const stopRecording = useCallback((): void => {
    if (isRecording && mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      try {
        mediaRecorder.current.stop();
        setError(null);
      } catch (originalError) {
        const error = createAudioRecordingError(originalError, 'Failed to stop recording');
        setError(error);
        // Force cleanup even if stop failed
        setIsRecording(false);
        setIsPaused(false);
        stopDurationTimer();
      }
    }
  }, [isRecording, createAudioRecordingError, stopDurationTimer]);

  const completeRecording = useCallback(async (): Promise<string | null> => {
    try {
      if (audioChunks.current.length === 0) {
        return null;
      }

      // Determine the MIME type from the recorded chunks or use a default
      const mimeType = config.mimeType ?? 'audio/webm';
      const audioBlob = new Blob(audioChunks.current, { type: mimeType });
      
      if (audioBlob.size === 0) {
        return null;
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      setError(null);
      return audioUrl;
    } catch (originalError) {
      const error = createAudioRecordingError(originalError, 'Failed to complete recording');
      setError(error);
      throw error;
    }
  }, [config.mimeType, createAudioRecordingError]);

  return {
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    completeRecording,
    isRecording,
    isPaused,
    duration,
    error,
    clearError,
  };
};
