import { Router } from 'express';
import { getUsers, createUser } from './user.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

router.get('/', getUsers);
router.post('/', createUser);

export default router;
