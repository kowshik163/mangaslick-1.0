import express from 'express';
import { 
  getProfile, 
  updateUsername, 
  updatePassword, 
  updateBio 
} from '../controllers/userController.js';
import authenticate from '../middleware/authenticate.js';
import { body } from 'express-validator';
import {
  addBookmark,
  removeBookmark,
  isBookmarked,
  getBookmarks,
} from '../controllers/bookmarksController.js';

const router = express.Router();
router.get('/', authenticate, getProfile);
router.post('/bookmarks', authenticate, addBookmark);
router.delete('/bookmarks/:id', authenticate, removeBookmark);
router.get('/bookmarks/:id', authenticate, isBookmarked);
router.get('/bookmarks', authenticate, getBookmarks);
// UPDATE username
router.put(
  '/username',
  authenticate,
  [
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
      .isLength({ max: 20 }).withMessage('Username cannot exceed 20 characters')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores')
  ],
  updateUsername
);

// UPDATE password
router.put(
  '/password',
  authenticate,
  [
    body('currentPassword')
      .notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[0-9]/).withMessage('Password must contain at least one number')
      .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
  ],
  updatePassword
);

// UPDATE bio
router.put(
  '/bio',
  authenticate,
  [
    body('bio')
      .trim()
      .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters')
  ],
  updateBio
);

export default router;