import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js'; 
import userRoutes from './routes/userRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors({
  origin: ['http://localhost:3000', 'https://764e-14-139-244-108.ngrok-free.app'],
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); // User-related routes
app.use('/api/comments', commentRoutes); // Comment-related routes

// Root route
app.get('/', (req, res) => {
  res.send('🚀 Server is running and connected to MongoDB!');
});
app.get('/test', (req, res) => {
  res.json({ message: 'Test route is working' });
});
// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});