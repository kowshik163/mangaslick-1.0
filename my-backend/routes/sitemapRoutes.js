import express from 'express';
import axios from 'axios';
import { redisClient, connectRedis } from '../redisClient.js';

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
  const cacheKey = 'sitemap:popular';
  const cacheTTL = 60 * 60 * 6; // 6 hours

  await connectRedis();

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      res.set('Content-Type', 'application/xml');
      return res.send(cached);
    }

    const baseUrl = 'https://mangaslick.vercel.app';

    const staticUrls = [
      `<url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
      `<url><loc>${baseUrl}/Community</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
      `<url><loc>${baseUrl}/genres</loc><priority>0.8</priority></url>`,
      `<url><loc>${baseUrl}/search</loc></url>`,
      `<url><loc>${baseUrl}/login</loc></url>`,
      `<url><loc>${baseUrl}/signup</loc></url>`
    ];

    const genres = [
      'most-viewed', 'action', 'adventure', 'comedy', 'drama',
      'fantasy', 'romance', 'school-life', 'sci-fi', 'slice-of-life',
      'supernatural', 'mystery', 'psychological', 'horror',
      'sports', 'isekai', 'revenge', 'murim'
    ];

    const genreUrls = genres.flatMap(genre =>
      Array.from({ length: 5 }, (_, i) =>
        `<url><loc>${baseUrl}/genre/${genre}/page/${i + 1}</loc></url>`
      )
    );

    const popularMangaIds = [
      'd4c9e0e9-2f76-4ef5-9282-89c3f7f6b94c', // One Piece
      'a3c6a3c2-46b4-4db8-a715-b2d15868e3aa', // Naruto
      '1eabe39d-3de2-47ec-a1d6-5d24189d2a29', // Bleach
      'b1f6524a-5d75-4f42-9f12-0d6b0f9b5df1', // Jujutsu Kaisen
      '91dffbfb-ff2e-4d71-80f3-6a1d0976d36a', // Chainsaw Man
      '3bcdbc52-3f93-4f99-ae8c-6ed4f6ed7297', // Attack on Titan
      '5f8bcf7b-bf2b-4ad1-8f2e-973100b210f7', // Demon Slayer
      'e457df73-bb36-4c8d-9a6a-5d0e7f1d3c6e', // Tokyo Revengers
      'bd59f773-53f4-4c52-bb67-280677c00eb4', // My Hero Academia
      '5120f9af-2c3f-4ee2-ae76-52770e63de21', // Death Note
      // Add more up to 50...
    ];

    const allChapterUrls = [];
    const mangaPageUrls = [];

    for (const mangaId of popularMangaIds) {
      // Manga detail page
      mangaPageUrls.push(`<url><loc>${baseUrl}/manga/${mangaId}</loc></url>`);

      // Fetch chapters
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const chapterRes = await axios.get('https://api.mangadex.org/chapter', {
          params: {
            manga: mangaId,
            translatedLanguage: ['en'],
            limit,
            offset,
            order: { chapter: 'asc' }
          }
        });

        const chapters = chapterRes.data.data;
        offset += limit;
        hasMore = chapters.length === limit;

        for (const ch of chapters) {
          allChapterUrls.push(`<url><loc>${baseUrl}/read/${mangaId}/${ch.id}</loc></url>`);
        }
      }
    }

    const allUrls = [...staticUrls, ...genreUrls, ...mangaPageUrls, ...allChapterUrls];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.join('\n')}
</urlset>`;

    await redisClient.set(cacheKey, sitemap, { EX: cacheTTL });

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (err) {
    console.error('❌ Error generating sitemap:', err.message);
    res.status(500).send('Sitemap generation failed');
  }
});

export default router;
