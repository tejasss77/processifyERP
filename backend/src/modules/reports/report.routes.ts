import { Router } from 'express';
import { getReportAnalytics } from './report.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/analytics', getReportAnalytics);

export default router;
