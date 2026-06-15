import { Router } from 'express';
import { body } from 'express-validator';
import * as users from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  nameRule,
  emailRule,
  addressRule,
  passwordRule,
  roleRule,
  handleValidation,
} from '../utils/validation';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', asyncHandler(users.dashboardStats));
router.get('/', asyncHandler(users.listUsers));
router.get('/:id', asyncHandler(users.getUser));

router.post(
  '/',
  [nameRule(), emailRule(), addressRule(), passwordRule(), roleRule()],
  handleValidation,
  asyncHandler(users.createUser),
);

router.patch(
  '/:id/role',
  [
    body('role')
      .isIn(['admin', 'user', 'owner'])
      .withMessage('Role must be one of admin, user or owner.'),
  ],
  handleValidation,
  asyncHandler(users.updateUserRole),
);

router.delete('/:id', asyncHandler(users.deleteUser));

export default router;
