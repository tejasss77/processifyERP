import { Router } from 'express';
import { getApprovals, approveRequest, rejectRequest } from './approval.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getApprovals);
router.post('/:id/approve', approveRequest);
router.post('/:id/reject', rejectRequest);

export default router;
