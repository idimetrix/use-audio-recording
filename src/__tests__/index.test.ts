import { renderHook, act } from "@testing-library/react";
import { useAudioRecording } from "../index";

// Mock MediaRecorder
const mockMediaRecorder = {
  start: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  stop: jest.fn(),
  ondataavailable: null,
  onstop: null,
  state: "inactive",
};

Object.defineProperty(global, "MediaRecorder", {
  writable: true,
  value: jest.fn().mockImplementation(() => mockMediaRecorder),
});

// Mock getUserMedia
Object.defineProperty(global.navigator, "mediaDevices", {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue({}),
  },
});

// Mock URL.createObjectURL
Object.defineProperty(global.URL, "createObjectURL", {
  writable: true,
  value: jest.fn().mockReturnValue("mock-url"),
});

describe("useAudioRecording", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should initialize with correct default values", () => {
    const { result } = renderHook(() => useAudioRecording());

    expect(result.current.isRecording).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(typeof result.current.startRecording).toBe("function");
    expect(typeof result.current.pauseRecording).toBe("function");
    expect(typeof result.current.resumeRecording).toBe("function");
    expect(typeof result.current.stopRecording).toBe("function");
    expect(typeof result.current.completeRecording).toBe("function");
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
    expect(mockMediaRecorder.start).toHaveBeenCalled();
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

    expect(mockMediaRecorder.stop).toHaveBeenCalled();
    expect(result.current.isRecording).toBe(false);
  });
});
