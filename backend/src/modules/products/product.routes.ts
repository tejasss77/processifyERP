import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  adjustStock,
} from './product.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', roleMiddleware(['ADMIN', 'WAREHOUSE']), createProduct);
router.put('/:id', roleMiddleware(['ADMIN', 'WAREHOUSE']), updateProduct);
router.post('/:id/stock', roleMiddleware(['ADMIN', 'WAREHOUSE']), adjustStock);

export default router;
