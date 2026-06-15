import { Router } from 'express';
import { body } from 'express-validator';
import * as ratings from '../controllers/rating.controller';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ratingRule, handleValidation } from '../utils/validation';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('user'),
  [body('storeId').isInt().withMessage('storeId must be an integer.'), ratingRule()],
  handleValidation,
  asyncHandler(ratings.submitRating),
);

export default router;
