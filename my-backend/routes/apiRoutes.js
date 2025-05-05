import express from 'express';
import { getMangaData } from '../controllers/apiController.js';

const router = express.Router();

// Match all routes like /mangadex/* and capture the rest
router.get('/mangadex/:proxyPath(*)', getMangaData);

export default router;