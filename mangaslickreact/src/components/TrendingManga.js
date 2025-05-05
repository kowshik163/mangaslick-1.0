import React, { useEffect, useState } from 'react';
import './trendingmanga.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TrendingManga = () => {
  const [mangas, setMangas] = useState([]);

  // Fetch trending mangas
  useEffect(() => {
    fetchTrendingManga();
  }, []);

  const fetchTrendingManga = async () => {
    try {
      const res = await axios.get(`/api/mangadex/manga`, {
        params: {
          limit: 14,
          order: { followedCount: 'desc' },
          includes: ['cover_art'],
        },
      });
 
      const formatted = res.data.data.map((item) => {
        const title = item.attributes.title?.en || 'Untitled';
        const id = item.id;
        const cover = item.relationships.find((rel) => rel.type === 'cover_art');

        // Ensure we're using the correct image URL
        const image = cover
          ? `https://uploads.mangadex.org/covers/${id}/${cover.attributes.fileName}.256.jpg`
          : 'https://via.placeholder.com/256x360?text=No+Image';

        return { title, image, id };
      });

      setMangas(formatted);
    } catch (err) {
      console.error('Failed to load trending manga', err);
    }
  };

  // Shift the manga list by one item every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setMangas((prevMangas) => {
        const newMangas = [...prevMangas];
        newMangas.push(newMangas.shift());
        return newMangas;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const shiftManga = (direction) => {
    setMangas((prevMangas) => {
      const newMangas = [...prevMangas];
      if (direction === 'left') {
        newMangas.unshift(newMangas.pop());
      } else if (direction === 'right') {
        newMangas.push(newMangas.shift());
      }
      return newMangas;
    });
  };

  return (
    <div className="trending-manga-container">
      <div className="trending-header">
        <h2 className="trending-title">🔥 Trending Manga</h2>
        <div className="scroll-buttons">
          <button onClick={() => shiftManga('left')}>◀</button>
          <button onClick={() => shiftManga('right')}>▶</button>
        </div>
      </div>
      <div className="trending-manga-list">
        {mangas.map((manga) =>
          manga?.id && manga?.image && manga?.title ? (
            <Link key={manga.id} to={`/manga/${manga.id}`} className="trending-manga-item">
              <img src={manga.image} alt={manga.title} loading='lazy' referrerPolicy='no-referrer' />
              <p className="trending-manga-item-title">{manga.title}</p>
            </Link>
          ) : null
        )}
      </div>
    </div>
  );
};

export default TrendingManga;
