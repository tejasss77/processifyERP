import { Router } from 'express';
import { Role } from '../../types/express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  addCustomerNote,
} from './customer.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', roleMiddleware(['ADMIN', 'SALES']), createCustomer);
router.put('/:id', roleMiddleware(['ADMIN', 'SALES']), updateCustomer);
router.post('/:id/notes', roleMiddleware(['ADMIN', 'SALES']), addCustomerNote);

export default router;
