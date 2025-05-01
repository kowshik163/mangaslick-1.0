import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  // In userSchema, make required fields explicit
bookmarks: [{
  title: { type: String, required: true },
  id: { type: String, required: true },
  coverImage: { type: String, required: true }
}],
  createdAt: { type: Date, default: Date.now },
  profilePhoto: { type: String, default: '' },
});

const User = mongoose.model('User', userSchema);
export default User;
