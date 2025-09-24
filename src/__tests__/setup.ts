/**
 * Jest setup file for test environment configuration
 */

// Extend Jest matchers
import '@testing-library/jest-dom';

// Global test setup for DOM environment
const MockMediaRecorder = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  stop: jest.fn(),
  ondataavailable: null,
  onstop: null,
  onerror: null,
  state: 'inactive',
}));

// Add static method
(MockMediaRecorder as any).isTypeSupported = jest.fn().mockReturnValue(true);

Object.defineProperty(global, 'MediaRecorder', {
  writable: true,
  value: MockMediaRecorder,
});

Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: jest.fn().mockReturnValue([
        { stop: jest.fn() }
      ])
    }),
  },
});

Object.defineProperty(global.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn().mockReturnValue('mock-url'),
});
