import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-\[\]\\;'/+=~`]).{8,16}$/;

export const nameRule = (field = 'name'): ValidationChain =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage('Name is required.');

export const emailRule = (field = 'email'): ValidationChain =>
  body(field)
    .trim()
    .isEmail()
    .withMessage('A valid email address is required.')
    .normalizeEmail();

export const addressRule = (field = 'address'): ValidationChain =>
  body(field)
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address must be at most 400 characters.')
    .notEmpty()
    .withMessage('Address is required.');

export const passwordRule = (field = 'password'): ValidationChain =>
  body(field)
    .matches(PASSWORD_REGEX)
    .withMessage(
      'Password must be 8-16 characters and include at least one uppercase letter and one special character.',
    );

export const roleRule = (field = 'role'): ValidationChain =>
  body(field)
    .optional()
    .isIn(['admin', 'user', 'owner'])
    .withMessage('Role must be one of admin, user or owner.');

export const ratingRule = (field = 'rating'): ValidationChain =>
  body(field)
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.');

export function handleValidation(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => ({
        field: 'path' in e ? e.path : undefined,
        message: e.msg,
      })),
    });
  }
  next();
}
