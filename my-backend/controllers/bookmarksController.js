import User from '../models/user.js';

// Add a manga to bookmarks
export const addBookmark = async (req, res) => {
  const { mangaId, mangaTitle, mangaImage } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    const alreadyBookmarked = user.bookmarks.some(b => b.id === mangaId);

    if (alreadyBookmarked) {
      // Return 200 (success) but tell the frontend it's already bookmarked
      return res.status(200).json({ 
        bookmarked: true,  // <-- Explicitly tell the frontend the current state
        message: 'Manga is already bookmarked' 
      });
    }

    // Add new bookmark if not already present
    const newBookmark = { id: mangaId, title: mangaTitle, coverImage: mangaImage };
    user.bookmarks.push(newBookmark);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ 
      bookmarked: true,
      message: 'Bookmark added successfully' 
    });
  } catch (err) {
    console.error('Add bookmark error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove a manga from bookmarks
export const removeBookmark = async (req, res) => {
  const { id: mangaId } = req.params;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    user.bookmarks = user.bookmarks.filter(b => b.id !== mangaId);
    await user.save();

    res.status(200).json({ message: 'Bookmark removed' });
  } catch (err) {
    console.error('Remove bookmark error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Check if manga is bookmarked (works as expected)
export const isBookmarked = async (req, res) => {
  const { id: mangaId } = req.params;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    const bookmarked = user.bookmarks.some(b => b.id === mangaId);
    res.status(200).json({ bookmarked });
  } catch (err) {
    console.error('Bookmark check error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all bookmarks
export const getBookmarks = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    console.log('User bookmarks:', user?.bookmarks);
    res.status(200).json({ bookmarks: user.bookmarks });
  } catch (err) {
    console.error('Get bookmarks error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
