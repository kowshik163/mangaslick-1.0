import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  username: String,
  text: String,
  time: { type: Date, default: Date.now },
});

const mangaCommentSchema = new mongoose.Schema({
  mangaId: String,
  username: String,
  text: String,
  time: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  likedBy: [String], // store user IDs who liked
  replies: [replySchema],
});

const MangaComment = mongoose.model('MangaComment', mangaCommentSchema);

export default MangaComment;
