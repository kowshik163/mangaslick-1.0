import React, { useState, useEffect } from 'react';
import './mangalist.css';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MangaCard from './MangaCard';

const MangaList = () => {
  const { type, pageNum } = useParams();
  const navigate = useNavigate();
  const page = parseInt(pageNum) || 1;

  const [mangaData, setMangaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 16;
  useEffect(() => {
    const genreMapping = {
      murim: ['martial arts','historical'],
      revenge: ['action','psychological','drama'] 
    };
  
    const fetchMangaData = async () => {
      try {
        setLoading(true);
        setError('');
        setHasMore(true);
  
        const offset = (page - 1) * ITEMS_PER_PAGE;
  
        const response = await axios.get('/manga', {
          params: {
            limit: ITEMS_PER_PAGE,
            offset: offset,
            order: { latestUploadedChapter: 'desc' },
            includes: ['cover_art'],
            contentRating: ['safe', 'suggestive'],
          },
        });
  
        const mangaList = response.data.data;
  
        const updatedMangaData = await Promise.all(
          mangaList.map(async (manga) => {
            const title = manga.attributes.title?.en || 'Untitled';
            const description = manga.attributes.description?.en || 'No description available';
            const tags = manga.attributes.tags?.map(tag => tag.attributes.name?.en?.toLowerCase()) || [];
  
            if (type) {
              const mappedGenres = genreMapping[type.toLowerCase()] || [type.toLowerCase()];
              const hasValidGenre = mappedGenres.some(genre => tags.includes(genre));
              if (!hasValidGenre) return null;
            }
  
            const coverRel = manga.relationships.find(rel => rel.type === 'cover_art');
    const coverFile = coverRel?.attributes?.fileName;
    const image = coverFile
      ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFile}.256.jpg?t=${Date.now()}`
      : 'https://via.placeholder.com/256x360?text=No+Image';
  
            const chapterRes = await axios.get('/chapter', {
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
          })
        );
  
        const filteredManga = updatedMangaData.filter(Boolean);
  
        setMangaData(filteredManga);
        setHasMore(filteredManga.length === ITEMS_PER_PAGE); // if less than limit, no more pages
      } catch (err) {
        console.error(err);
        setError('Failed to fetch manga data.');
      } finally {
        setLoading(false);
      }
    };
  
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchMangaData();
  }, [type, page]);
  

  const goToPage = (p) => {
    if (type) navigate(`/genre/${type}/page/${p}`);
    else navigate(`/page/${p}`);
  };

  const renderPageNumbers = () => {
    const buttons = [];
    for (let i = page - 1; i <= page + 1; i++) {
      if (i < 1) continue;
      buttons.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          disabled={i === page}
          style={{
            margin: '0 4px',
            padding: '6px 10px',
            backgroundColor: i === page ? '#555' : '#ddd',
            color: i === page ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: i === page ? 'default' : 'pointer',
          }}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="homepage">
      <h1 style={{ color: 'white', textAlign: 'center' }}>
        {type ? `${type.charAt(0).toUpperCase() + type.slice(1)} Manga` : 'Latest Manga'}
      </h1>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'white' }}>Loading manga...</p>
      ) : error ? (
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
      ) : (
        <>
          <div className="mainpage1">
          {mangaData.length > 0 ? (
  mangaData.map((manga) =>
    manga ? (
      <MangaCard
        key={manga.id}
        id={manga.id}
        image={manga.image}
        title={manga.title}
        latestChapters={manga.latestChapters}
        description={manga.description}
      />
    ) : null
  )
) : (
  <p style={{ color: 'white', textAlign: 'center' }}>No manga available.</p>
)}

          </div>

          <div style={{ marginTop: '30px', textAlign: 'center', color: 'white', margin: 'auto' }}>
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              style={{ padding: '8px 10px', marginRight: '10px' }}
            >
              ◀ Prev
            </button>

            {renderPageNumbers()}

            <button
              onClick={() => goToPage(page + 1)}
              disabled={!hasMore}
              style={{ padding: '8px 10px', marginLeft: '10px' }}
            >
              Next ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MangaList;