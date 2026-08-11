import { Router } from 'express';
import { getStockMovements } from './stock-movement.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getStockMovements);

export default router;
