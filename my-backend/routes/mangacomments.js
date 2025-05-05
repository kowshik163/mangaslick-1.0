import express from 'express';
import MangaComment from '../models/MangaComment.js';
import authenticate from '../middleware/authenticate.js';
const router = express.Router();
router.get('/:mangaId/comments', async (req, res) => {
  const { mangaId } = req.params;
  
  try {
    const comments = await MangaComment.find({ mangaId }).sort({ time: 1 });
    res.json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post('/:mangaId/comments', authenticate, async (req, res) => {
    try {
      const { mangaId } = req.params;
      const { text } = req.body;
      if (!text || text.trim() === '') {
        return res.status(400).json({ message: 'Text is required.' });
      }
  
      const newComment = new MangaComment({
        mangaId,
        username: req.user.username,
        text,
      });
  
      await newComment.save();
      res.status(201).json(newComment);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
  
router.post('/:mangaId/comments/:commentId/reply', authenticate, async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;

  const comment = await MangaComment.findById(commentId);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });

  comment.replies.push({
    username: req.user.username,
    text,
  });

  await comment.save();
  res.json(comment);
});

router.post('/:mangaId/comments/:commentId/like', authenticate, async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  const comment = await MangaComment.findById(commentId);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });

  const alreadyLiked = comment.likedBy.includes(userId);
  if (alreadyLiked) {
    comment.likes -= 1;
    comment.likedBy = comment.likedBy.filter(id => id !== userId);
  } else {
    comment.likes += 1;
    comment.likedBy.push(userId);
  }

  await comment.save();
  res.json({ likes: comment.likes });
});

export default router;
