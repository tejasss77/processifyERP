import { Router } from 'express';
import {
  getChallans,
  getChallanById,
  createDraftChallan,
  confirmChallan,
  cancelChallan,
} from './challan.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getChallans);
router.get('/:id', getChallanById);
router.post('/', roleMiddleware(['ADMIN', 'SALES']), createDraftChallan);
router.post('/:id/confirm', roleMiddleware(['ADMIN', 'SALES']), confirmChallan);
router.post('/:id/cancel', roleMiddleware(['ADMIN', 'SALES']), cancelChallan);

export default router;
