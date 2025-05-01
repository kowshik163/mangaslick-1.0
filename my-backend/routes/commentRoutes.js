import express from 'express';
import { getComments, postComment, likeComment, replyComment } from '../controllers/commentController.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

router.get('/', getComments);
router.post('/', authenticate, postComment);
router.post('/like/:id', authenticate, likeComment);
router.post('/reply/:id', authenticate, replyComment);

export default router;
