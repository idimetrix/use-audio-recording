import { renderHook, act } from "@testing-library/react";
import { useAudioRecording } from "../index";

describe("useAudioRecording", () => {
  let mockMediaRecorder: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create fresh mock for each test
    mockMediaRecorder = {
      start: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      stop: jest.fn(),
      ondataavailable: null,
      onstop: null,
      onerror: null,
      state: "recording",
    };

    // Update the mock implementation
    const MockMediaRecorder = jest.fn().mockImplementation(() => mockMediaRecorder);
    (MockMediaRecorder as any).isTypeSupported = jest.fn().mockReturnValue(true);
    (global.MediaRecorder as any) = MockMediaRecorder;
  });

  test("should initialize with correct default values", () => {
    const { result } = renderHook(() => useAudioRecording());

    expect(result.current.isRecording).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.duration).toBe(0);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.startRecording).toBe("function");
    expect(typeof result.current.pauseRecording).toBe("function");
    expect(typeof result.current.resumeRecording).toBe("function");
    expect(typeof result.current.stopRecording).toBe("function");
    expect(typeof result.current.completeRecording).toBe("function");
    expect(typeof result.current.clearError).toBe("function");
  });

  test("should start recording when startRecording is called", async () => {
    const { result } = renderHook(() => useAudioRecording());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: true,
    });
    expect(MediaRecorder).toHaveBeenCalled();
    expect(mockMediaRecorder.start).toHaveBeenCalledWith(1000);
    expect(result.current.isRecording).toBe(true);
  });

  test("should pause recording when pauseRecording is called", async () => {
    const { result } = renderHook(() => useAudioRecording());

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      result.current.pauseRecording();
    });

    expect(mockMediaRecorder.pause).toHaveBeenCalled();
    expect(result.current.isPaused).toBe(true);
  });

  test("should resume recording when resumeRecording is called", async () => {
    const { result } = renderHook(() => useAudioRecording());

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      result.current.pauseRecording();
    });

    // Set the mock state to paused for resume to work
    mockMediaRecorder.state = "paused";

    act(() => {
      result.current.resumeRecording();
    });

    expect(mockMediaRecorder.resume).toHaveBeenCalled();
    expect(result.current.isPaused).toBe(false);
  });

  test("should stop recording when stopRecording is called", async () => {
    const { result } = renderHook(() => useAudioRecording());

    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      result.current.stopRecording();
    });

    // Simulate the onstop event being called
    act(() => {
      if (mockMediaRecorder.onstop) {
        mockMediaRecorder.onstop();
      }
    });

    expect(mockMediaRecorder.stop).toHaveBeenCalled();
    expect(result.current.isRecording).toBe(false);
  });

  test("should handle error when getUserMedia fails", async () => {
    const mockGetUserMedia = jest.fn().mockRejectedValue(new DOMException("Permission denied", "NotAllowedError"));
    (global.navigator.mediaDevices.getUserMedia as jest.Mock) = mockGetUserMedia;

    const { result } = renderHook(() => useAudioRecording());

    await act(async () => {
      try {
        await result.current.startRecording();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.name).toBe("NotAllowedError");
    expect(result.current.isRecording).toBe(false);
  });

  test("should clear error when clearError is called", async () => {
    const mockGetUserMedia = jest.fn().mockRejectedValue(new Error("Test error"));
    (global.navigator.mediaDevices.getUserMedia as jest.Mock) = mockGetUserMedia;

    const { result } = renderHook(() => useAudioRecording());

    await act(async () => {
      try {
        await result.current.startRecording();
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBeDefined();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });

  test("should handle configuration options", () => {
    const config = {
      audioConstraints: { echoCancellation: true },
      mimeType: "audio/mp4",
    };

    const { result } = renderHook(() => useAudioRecording(config));

    expect(result.current.isRecording).toBe(false);
    expect(result.current.duration).toBe(0);
  });

  test("should track duration", async () => {
    jest.useFakeTimers();
    
    // Reset the global mock for this test to allow getUserMedia to succeed
    (global.navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValue({});
    
    const { result } = renderHook(() => useAudioRecording());

    await act(async () => {
      await result.current.startRecording();
    });

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.duration).toBeGreaterThan(0);

    jest.useRealTimers();
  });
});
