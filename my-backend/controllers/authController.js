import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Signup (Register a new user)
export const signup = async (req, res) => {
  const { username, email, password } = req.body;

  // Ensure all fields are provided
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user and save it
    const newUser = new User({ username, email, password: hashedPassword });
    const savedUser = await newUser.save();

    // Generate a JWT token for the user
    const token = jwt.sign(
      { userId: savedUser._id, email: savedUser.email, username: savedUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Respond with success and the token
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: { email: savedUser.email, username: savedUser.username }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Signup failed. Please try again.' });
  }
};

// Login (Authenticate existing user)
export const login = async (req, res) => {
  const { email, password } = req.body;

  // Ensure email and password are provided
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email not registered' });
    }

    // Check if the password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Generate a JWT token for the user
    const token = jwt.sign(
      { userId: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Respond with success and the token
    res.json({ success: true, message: 'Login successful', token, user: { email: user.email, username: user.username } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};
