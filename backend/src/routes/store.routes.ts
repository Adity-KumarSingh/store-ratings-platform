import { Router } from 'express';
import { body } from 'express-validator';
import * as stores from '../controllers/store.controller';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { nameRule, emailRule, addressRule, handleValidation } from '../utils/validation';

const router = Router();

router.use(authenticate);

router.get('/owner/dashboard', authorize('owner'), asyncHandler(stores.ownerDashboard));

router.get('/', asyncHandler(stores.listStores));

router.post(
  '/',
  authorize('admin'),
  [
    nameRule(),
    emailRule(),
    addressRule(),
    body('ownerId').optional({ nullable: true }).isInt().withMessage('ownerId must be an integer.'),
  ],
  handleValidation,
  asyncHandler(stores.createStore),
);

router.delete('/:id', authorize('admin'), asyncHandler(stores.deleteStore));

export default router;
