// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DATABASE_URL = 'sqlite::memory:';

// Mock Sequelize models to prevent initialization issues
jest.mock('../src/models/User', () => ({
  init: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock('../src/models/Team', () => ({
  init: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock('../src/models/League', () => ({
  init: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock('../src/models/Game', () => ({
  init: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock('../src/models/Pick', () => ({
  init: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
