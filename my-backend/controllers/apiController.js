import axios from 'axios';

// Redis cache duration (1 hour)
const CACHE_DURATION = 60 * 60;

// Proxy and caching logic
export const getMangaData = async (req, res) => {
  const redisClient = req.app.locals.redisClient;

  // Validate Redis connection
  if (!redisClient || !redisClient.isOpen) {
    console.error('Redis connection not available');
    // Continue without cache rather than failing
  }

  const proxyPath = (req.params.proxyPath || '').replace(/^\/+|\/+$/g, '');
  const query = req._parsedUrl.search || '';
  
  // Construct URL more safely
  const url = new URL(`https://api.mangadex.org/`);
  url.pathname = proxyPath;
  url.search = query;

  // Normalize cache key by sorting query params
  const cacheKey = `mangadex:${url.pathname}${url.searchParams.toString() ? '?' + new URLSearchParams([...url.searchParams.entries()].sort()).toString() : ''}`;

  try {
    let cachedData;
    // Check for cached data in Redis
    if (redisClient?.isOpen) {
      try {
        cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          res.set('X-Cache', 'HIT');
          // console.log("Cache hit");
          return res.json(JSON.parse(cachedData));
        }
        // console.log("Cache miss");
      } catch (redisErr) {
        console.error('Redis error:', redisErr);
        // Proceed with API request if Redis cache fetch fails
      }
    }

    // Fetch data from MangaDex API
    const response = await axios.get(url.toString(), {
      headers: {
        'Authorization': req.headers.authorization || '',
        'Accept-Encoding': 'gzip', // Recommended for MangaDex API
      },
      timeout: 10000 // Timeout to avoid long hanging requests
    });

    // Cache the API response in Redis
    if (redisClient?.isOpen && response.data) {
      try {
        await redisClient.setEx(cacheKey, CACHE_DURATION, JSON.stringify(response.data));
      } catch (redisErr) {
        console.error('Redis set error:', redisErr);
      }
    }

    // Forward rate limit headers for the response
    const rateLimitHeaders = [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset'
    ];
    rateLimitHeaders.forEach(header => {
      if (response.headers[header.toLowerCase()]) {
        res.set(header, response.headers[header.toLowerCase()]);
      }
    });

    res.set('X-Cache', 'MISS');
    res.json(response.data);
  } catch (err) {
    console.error('MangaDex proxy error:', err);

    // Handle errors and provide a detailed response
    const statusCode = err.response?.status || 500;
    const errorMessage = err.response?.data?.message || 'Failed to fetch from MangaDex';

    res.status(statusCode).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      ...(err.response?.data && { apiError: err.response.data })
    });
  }
};
