/**
 * Configuration globale pour les tests
 */

import '@testing-library/jest-dom';

// Mock console.log pour les tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock pour les timers
jest.setTimeout(10000);

// Configuration globale pour les tests WebSocket
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllTimers();
});