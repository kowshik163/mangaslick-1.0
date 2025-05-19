export default async function handler(req, res) {
  try {
    const response = await fetch('https://backend-production-0226e.up.railway.app/mysitemap.xml');
    if (!response.ok) {
      res.status(response.status).send('Failed to fetch sitemap');
      return;
    }
    const xml = await response.text();

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error proxying sitemap:', error);
    res.status(500).send('Internal Server Error');
  }
}