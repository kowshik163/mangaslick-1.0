import React from 'react';
import './genrelist.css';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const GenreList = () => {
  const navigate = useNavigate();

  // Mapping known genres to MangaDex tag IDs or closely associated categories
  const genres = [
    { name: 'Most Viewed', id: 'most-viewed' },
    { name: 'Action', id: 'action' },
    { name: 'Adventure', id: 'adventure' },
    { name: 'Comedy', id: 'comedy' },
    { name: 'Drama', id: 'drama' },
    { name: 'Fantasy', id: 'fantasy' },
    { name: 'Romance', id: 'romance' },
    { name: 'School Life', id: 'school-life', tag: 'school-life' },
    { name: 'Sci-Fi', id: 'sci-fi', tag: 'sci-fi' },
    { name: 'Slice of Life', id: 'slice-of-life', tag: 'slice-of-life' },
    { name: 'Supernatural', id: 'supernatural', tag: 'supernatural' },
    { name: 'Mystery', id: 'mystery' },
    { name: 'Psychological', id: 'psychological' },
    { name: 'Horror', id: 'horror' },
    { name: 'Sports', id: 'sports' },
    { name: 'Isekai', id: 'isekai' },
    // Map "Revenge" to "Drama" or "Psychological"
    { name: 'Revenge', id: 'revenge', alias: ['drama', 'psychological'] },
    // Map "Murim" to "Martial Arts" + "Historical"
    { name: 'Murim', id: 'murim', alias: ['martial-arts', 'historical'] },
  ];

  const handleClick = (genreId) => {
    navigate(`/genre/${genreId}/page/1`);
  };

  return (
    <div className="genre">
      {/* SEO Meta Tags using Helmet */}
      <Helmet>
        <title>Genres | MangaSlick</title>
        <meta
          name="description"
          content="Browse various manga genres like Action, Adventure, Romance, Fantasy, and more. Find your next favorite manga!"
        />
        <meta property="og:title" content="Genres | MangaSlick" />
        <meta
          property="og:description"
          content="Browse various manga genres like Action, Adventure, Romance, Fantasy, and more. Find your next favorite manga!"
        />
        <meta
          property="og:image"
          content="https://via.placeholder.com/256x360?text=MangaSlick"
        />
        <meta name="twitter:title" content="Genres | MangaSlick" />
        <meta
          name="twitter:description"
          content="Browse various manga genres like Action, Adventure, Romance, Fantasy, and more. Find your next favorite manga!"
        />
        <meta
          name="twitter:image"
          content="https://via.placeholder.com/256x360?text=MangaSlick"
        />
      </Helmet>

      <h2> All genres</h2>
      <hr />
      {genres.map((genre) => (
        <div key={genre.id} className="g1" onClick={() => handleClick(genre.id)}>
          {genre.name}
        </div>
      ))}
    </div>
  );
};

export default GenreList;