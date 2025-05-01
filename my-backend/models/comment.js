import mongoose from 'mongoose';

const ReplySchema = new mongoose.Schema({
  username: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: Date, default: Date.now },
});

const CommentSchema = new mongoose.Schema({
  mangaId: { type: String, default: null },
  username: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  replies: [ReplySchema],
});

const Comment = mongoose.model('Comment', CommentSchema);

export default Comment;
