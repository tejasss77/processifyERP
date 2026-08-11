import { Router } from 'express';
import { getDashboardMetrics } from './dashboard.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/metrics', getDashboardMetrics);

export default router;
