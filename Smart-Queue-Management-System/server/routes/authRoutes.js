import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { register, login, logout, me } from '../controllers/authController.js';

const router = Router();

router.post('/register', [
  body('fullName').trim().notEmpty().withMessage('Full name is required.').isLength({ min: 2, max: 60 }).withMessage('Full name must contain at least 2 characters.'),
  body('email').trim().isEmail().withMessage('Please provide a valid email address.'),
  body('phoneNumber').trim().matches(/^\+?[0-9\s\-()]{7,15}$/).withMessage('Please provide a valid phone number.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must include at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must include at least one lowercase letter.')
    .matches(/[0-9]/).withMessage('Password must include at least one number.'),
  body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match.')
], validate, register);

router.post('/login', [
  body('email').trim().notEmpty().withMessage('Email is required.'),
  body('password').notEmpty().withMessage('Password is required.')
], validate, login);

router.post('/logout', logout);
router.get('/me', protect, me);

export default router;