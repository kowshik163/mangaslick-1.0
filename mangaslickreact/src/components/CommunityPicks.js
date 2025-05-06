import React, { useEffect, useState } from 'react';
import MangaCard from './MangaCard';
import axios from 'axios';
import './mangalist.css'; // Reuse the same styles

const COMMUNITY_MANGA_IDS = [
  '9ed16bc9-f570-4e71-8dda-aebc098b683b',
  '69fdf64b-683c-4957-805c-e47dc758cb1b',
  'a1c7c817-4e59-43b7-9365-09675a149a6f',
  '69e218ec-93eb-4025-ae39-33d47b1160e0',
  '53316f95-a8d0-405a-845f-8dc206fee760',
  '6b1eb93e-473a-4ab3-9922-1a66d2a29a4a',
  '239d6260-d71f-43b0-afff-074e3619e3de',
  'c00dcb59-bb29-4f68-b600-40954366ca1a',
  '596191eb-69ee-4401-983e-cc07e277fa17',
  '6a468761-5bd6-4de0-a0cb-47cb456ac2e0',
  '4ada20eb-085a-491a-8c49-477ab42014d7',
  'b35f67b6-bfb9-4cbd-86f0-621f37e6cb41',
  '32d76d19-8a05-4db0-9fc2-e0b0648fe9d0',
];

const CommunityPicks = () => {
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunityManga = async () => {
      try {
        const mangaDetails = await Promise.all(COMMUNITY_MANGA_IDS.map(async (id) => {
          const mangaRes = await axios.get(`/api/mangadex/manga/${id}`, {
            params: {
              includes: ['cover_art'],
            },
          });

          const manga = mangaRes.data.data;
          const title = manga.attributes.title?.en || 'Untitled';
          const description = manga.attributes.description?.en || 'No description available';

          const coverRel = manga.relationships.find(rel => rel.type === 'cover_art');
          const coverFile = coverRel?.attributes?.fileName;
          const image = coverFile
            ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFile}.256.jpg`
            : 'https://via.placeholder.com/256x360?text=No+Image';

          const chapterRes = await axios.get('/api/mangadex/chapter', {
            params: {
              manga: manga.id,
              limit: 3,
              order: { chapter: 'desc' },
            },
          });

          const latestChapters = chapterRes.data?.data || [];

          return {
            id: manga.id,
            title,
            image,
            latestChapters: latestChapters.map((chapter) => ({
              number: chapter.attributes?.chapter || 'N/A',
              chapterId: chapter.id || null,
            })),
            description,
          };
        }));

        setMangaList(mangaDetails);
      } catch (err) {
        console.error('Failed to load community picks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityManga();
  }, []);

  return (
    <div className="homepage">
       {/* SEO Meta Tags using Helmet */}
       <Helmet>
        <title>Community Picks | MangaSlick</title>
        <meta
          name="description"
          content="Explore the best manga selected by the community. Check out the latest manga chapters and discover hidden gems!"
        />
        <meta property="og:title" content="Community Picks | MangaSlick" />
        <meta
          property="og:description"
          content="Explore the best manga selected by the community. Check out the latest manga chapters and discover hidden gems!"
        />
        <meta
          property="og:image"
          content="https://via.placeholder.com/256x360?text=MangaSlick"
        />
        <meta name="twitter:title" content="Community Picks | MangaSlick" />
        <meta
          name="twitter:description"
          content="Explore the best manga selected by the community. Check out the latest manga chapters and discover hidden gems!"
        />
        <meta
          name="twitter:image"
          content="https://via.placeholder.com/256x360?text=MangaSlick"
        />
      </Helmet>
      <h1 style={{ color: 'white', textAlign: 'center' }}>🌟 Community Picks</h1>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'white' }}>Loading...</p>
      ) : (
        <div className="mainpage1">
          {mangaList.map(manga => (
            <MangaCard
              key={manga.id}
              id={manga.id}
              image={manga.image}
              title={manga.title}
              latestChapters={manga.latestChapters}
              description={manga.description}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityPicks;