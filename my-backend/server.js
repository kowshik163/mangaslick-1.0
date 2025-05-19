import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cron from 'node-cron';
import authRoutes from './routes/authRoutes.js'; 
import userRoutes from './routes/userRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import mangadexRoutes from './routes/apiRoutes.js';
import mangacomments from './routes/mangacomments.js';
import Comment from './models/comment.js';
import { redisClient, connectRedis } from './redisClient.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Connect to Redis and assign to app.locals
await connectRedis();
app.locals.redisClient = redisClient;

const allowedOrigins = [
  'https://mangaslick.vercel.app',
  'http://localhost:3000',
  'https://backend-production-0226e.up.railway.app',
  'https://510f-2405-201-c03a-7069-a1ab-e5dd-37f2-2d47.ngrok-free.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin); // <- important fix here
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));


// Routes
app.use('/api', mangadexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/comments', commentRoutes);//for global comments
app.use('/api', mangacomments);//for manga comments

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

app.get('/mysitemap.xml', (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'mysitemap.xml');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/xml');
    fs.createReadStream(filePath).pipe(res);œ
  } else {
    res.status(404).send('Sitemap not found');
  }
});
app.get('/', (req, res) => {
  res.send('🚀 Server is running and connected to MongoDB!');
});
app.get('/test', (req, res) => {
  res.json({ message: 'Test route is working' });
});


app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});


cron.schedule('0 0 * * *', async () => {
  try {
    const result = await Comment.deleteMany({ mangaId: null });
    console.log(`🗑️ Deleted ${result.deletedCount} global comments.`);
  } catch (error) {
    console.error('❌ Error deleting global comments:', error.message);
  }
});
