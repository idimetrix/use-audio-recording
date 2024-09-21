import { useState, useRef } from "react";

interface UseAudioRecording {
  startRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  completeRecording: () => Promise<string | null>;
  isRecording: boolean;
  isPaused: boolean;
}

export const useAudioRecording = (): UseAudioRecording => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (
      !isRecording &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    ) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaRecorder.current = new MediaRecorder(stream);
        audioChunks.current = [];

        mediaRecorder.current.ondataavailable = (event: BlobEvent) => {
          audioChunks.current.push(event.data);
        };

        mediaRecorder.current.onstop = () => {
          setIsRecording(false);
          setIsPaused(false);
        };

        mediaRecorder.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone", error);
      }
    }
  };

  const pauseRecording = () => {
    if (isRecording && !isPaused && mediaRecorder.current) {
      mediaRecorder.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (isRecording && isPaused && mediaRecorder.current) {
      mediaRecorder.current.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (isRecording && mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const completeRecording = (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (audioChunks.current.length > 0) {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        resolve(audioUrl);
      } else {
        resolve(null);
      }
    });
  };

  return {
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    completeRecording,
    isRecording,
    isPaused,
  };
};
