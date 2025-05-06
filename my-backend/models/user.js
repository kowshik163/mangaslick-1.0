import mongoose from 'mongoose';
const bookmarkSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  coverImage: { type: String, required: true }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  bookmarks: [bookmarkSchema],
  createdAt: { type: Date, default: Date.now },
  profilePhoto: { type: String, default: '' },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;

