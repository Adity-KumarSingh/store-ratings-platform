import { Router } from 'express';
import { body } from 'express-validator';
import * as auth from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  nameRule,
  emailRule,
  addressRule,
  passwordRule,
  handleValidation,
} from '../utils/validation';

const router = Router();

router.post(
  '/signup',
  [nameRule(), emailRule(), addressRule(), passwordRule()],
  handleValidation,
  asyncHandler(auth.signup),
);

router.post(
  '/login',
  [emailRule(), body('password').notEmpty().withMessage('Password is required.')],
  handleValidation,
  asyncHandler(auth.login),
);

router.get('/me', authenticate, asyncHandler(auth.me));

router.put(
  '/password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    passwordRule('newPassword'),
  ],
  handleValidation,
  asyncHandler(auth.updatePassword),
);

export default router;
