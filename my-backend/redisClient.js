// redisClient.js
import { createClient } from 'redis';

const redisUrl = 'redis://default:sPJ4jAgyXckyX1IwcFXtUlHLYyAJDlkt@redis-17260.c279.us-central1-1.gce.redns.redis-cloud.com:17260';

const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => console.error('❌ Redis Client Error', err));

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('✅ Connected to Redis');
  }
};

export { redisClient, connectRedis };