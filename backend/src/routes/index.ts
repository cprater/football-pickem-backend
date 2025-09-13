import { Router } from 'express';
import authRoutes from './auth';
import leagueRoutes from './leagues';
import gameRoutes from './games';
import pickRoutes from './picks';

const router = Router();

// API version prefix
const API_PREFIX = '/api/v1';

// Mount routes
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/leagues`, leagueRoutes);
router.use(`${API_PREFIX}/games`, gameRoutes);
router.use(`${API_PREFIX}/picks`, pickRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
