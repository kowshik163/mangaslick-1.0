import Comment from '../models/comment.js';

export const getComments = async (req, res) => {
  try {
    // Fetch global comments where mangaId is null
    const comments = await Comment.find({ mangaId: null }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching comments' });
  }
};


export const postComment = async (req, res) => {
  const { text } = req.body;
  const username = req.user.username;

  if (!text) return res.status(400).json({ success: false, message: 'Text is required' });

  try {
    const comment = new Comment({ username, text, time: new Date(), likes: 0, replies: [] });
    const savedComment = await comment.save();
    res.status(201).json(savedComment);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save comment' });
  }
};

export const likeComment = async (req, res) => {
  const { id } = req.params;

  try {
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    comment.likes += 1;
    await comment.save();
    res.status(200).json({ success: true, message: 'Comment liked', likes: comment.likes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error liking comment' });
  }
};

export const replyComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text) return res.status(400).json({ success: false, message: 'Reply text is required' });

  try {
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    comment.replies.push({ username: req.user.username, text, time: new Date() });
    await comment.save();
    res.status(200).json({ success: true, message: 'Reply added', replies: comment.replies });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding reply' });
  }
};
