import User from '../models/user.js';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt'; // Add this at the top
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    console.log('req.user:', req.user);
    res.status(200).json({
      success: true,
      data: {
        username: user.username,
        bio: user.bio,
        created_at: user.createdAt,
        profile_photo: user.profilePhoto,
        bookmarks: user.bookmarks || [],
      }
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching profile' 
    });
  }
};

export const updateUsername = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const { username } = req.body;
  
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    const existingUser = await User.findOne({ username }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: 'Username already taken' 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username },
      { new: true, session }
    ).select('-password');

    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    await session.commitTransaction();
    res.status(200).json({ 
      success: true, 
      message: 'Username updated successfully',
      data: { username: user.username }
    });
  } catch (err) {
    await session?.abortTransaction();
    console.error('Username update error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating username' 
    });
  }
};

export const updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const { currentPassword, newPassword } = req.body;
  
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const user = await User.findById(req.user.id).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be different from current password' 
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save({ session });

    await session.commitTransaction();
    res.status(200).json({ 
      success: true, 
      message: 'Password updated successfully' 
    });
  } catch (err) {
    await session?.abortTransaction();
    console.error('Password update error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating password' 
    });
  }
};

export const updateBio = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const { bio } = req.body;
  
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { bio },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Bio updated successfully',
      data: { bio: user.bio }
    });
  } catch (err) {
    console.error('Bio update error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating bio' 
    });
  }
};