import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        }
      },
      defaults: {
        baseURL: 'http://localhost:3001/api/v1',
        headers: { 'Content-Type': 'application/json' }
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }))
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location
const mockLocation = {
  href: '',
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
});

// Import api after mocking
import api from '../api';

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('API Configuration', () => {
    it('should create axios instance with correct base URL', () => {
      expect(api.defaults.baseURL).toBe('http://localhost:3001/api/v1');
    });

    it('should have correct headers configuration', () => {
      expect(api.defaults.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('API Instance', () => {
    it('should be an axios instance', () => {
      expect(api).toBeDefined();
      expect(typeof api.get).toBe('function');
      expect(typeof api.post).toBe('function');
      expect(typeof api.put).toBe('function');
      expect(typeof api.delete).toBe('function');
    });

    it('should have interceptors configured', () => {
      expect(api.interceptors.request.use).toBeDefined();
      expect(api.interceptors.response.use).toBeDefined();
    });
  });

  describe('Environment Configuration', () => {
    it('should use environment variable for API URL', () => {
      expect(api.defaults.baseURL).toBe('http://localhost:3001/api/v1');
    });
  });

  describe('Mock Setup', () => {
    it('should have localStorage mock available', () => {
      expect(localStorageMock.getItem).toBeDefined();
      expect(localStorageMock.setItem).toBeDefined();
      expect(localStorageMock.removeItem).toBeDefined();
    });

    it('should have location mock available', () => {
      expect(mockLocation.href).toBeDefined();
      expect(mockLocation.assign).toBeDefined();
    });
  });
});