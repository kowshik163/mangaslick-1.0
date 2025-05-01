import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MangaComments from './MangaComments';
import './mangadetails.css';

const MangaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [visibleCount, setVisibleCount] = useState(20);
  const [sortOrder, setSortOrder] = useState('desc');
  const [bookmarked, setBookmarked] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [volumes, setVolumes] = useState({});
  const [activeVolume, setActiveVolume] = useState(null);
  const [totalChapters, setTotalChapters] = useState(0);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Fetch Manga Details
  const fetchMangaDetails = useCallback(async () => {
    try {
      const [detailsRes, statsRes] = await Promise.all([
        axios.get(`/manga/${id}`, {
          params: { includes: ['author', 'artist', 'cover_art'] },
        }),
        axios.get(`/statistics/manga/${id}`),
      ]);

      const data = detailsRes.data.data;
      const stats = statsRes.data.statistics[id] || {};

      const coverArt = data.relationships.find(rel => rel.type === 'cover_art');
      const coverUrl = coverArt
        ? `https://uploads.mangadex.org/covers/${id}/${coverArt.attributes.fileName}.512.jpg`
        : 'https://via.placeholder.com/512x720?text=No+Image';

      const mangaData = {
        id,
        title: data.attributes.title?.en || Object.values(data.attributes.title)[0] || 'Untitled',
        description: data.attributes.description?.en || 'No description available.',
        status: data.attributes.status || 'Unknown',
        year: data.attributes.year || 'N/A',
        originalLanguage: data.attributes.originalLanguage || 'N/A',
        authors: data.relationships.filter(r => r.type === 'author').map(r => r.attributes.name).join(', '),
        artists: data.relationships.filter(r => r.type === 'artist').map(r => r.attributes.name).join(', '),
        tags: Array.isArray(data.attributes.tags)
          ? data.attributes.tags.map(tag => tag.attributes.name?.en).filter(Boolean)
          : [],
        altTitles: data.attributes.altTitles || [],
        averageRating: stats.rating?.average || null,
        ratingCount: stats.rating?.ratingUserCount || 0,
        lastUpdated: data.attributes.updatedAt || null,
        image: coverUrl,
      };

      setManga(mangaData);
    } catch (err) {
      console.error('Failed to fetch manga details:', err);
      setError('Failed to load manga details.');
    }
  }, [id]);

  // Fetch Chapters
  const fetchChapters = useCallback(async (offsetValue = 0, order = sortOrder) => {
    try {
      setLoading(true);

      const res = await axios.get(`/chapter`, {
        params: {
          manga: id,
          limit: 100,
          offset: offsetValue,
          translatedLanguage: ['en'],
          order: { chapter: order },
          contentRating: ['safe', 'suggestive', 'erotica'],
        },
      });

      const newChapters = res.data.data.map(chap => ({
        id: chap.id,
        number: chap.attributes.chapter ? parseFloat(chap.attributes.chapter) : 0,
        title: chap.attributes.title || `Chapter ${chap.attributes.chapter || '?'}`,
        volume: chap.attributes.volume || 'none',
        date: new Date(chap.attributes.updatedAt).toLocaleDateString(),
      }));

      if (offsetValue === 0) {
        setChapters(newChapters);
      } else {
        setChapters(prev => [...prev, ...newChapters]);
      }

      setTotalChapters(res.data.total);
      setHasMore(offsetValue + 100 < res.data.total);
      setOffset(prev => prev + newChapters.length);

      // Group chapters into volumes
      const grouped = {};
      newChapters.forEach(chap => {
        if (!grouped[chap.volume]) grouped[chap.volume] = [];
        grouped[chap.volume].push(chap);
      });

      setVolumes(prev => ({ ...prev, ...grouped }));
    } catch (err) {
      console.error('Failed to fetch chapters:', err);
      setError('Failed to load chapters.');
    } finally {
      setLoading(false);
    }
  }, [id, sortOrder]);

  // Fetch bookmark status from the backend
  const fetchBookmarkStatus = useCallback(async () => {
    try {
      const currentToken = token || localStorage.getItem('token');
      if (!currentToken) {
        setBookmarked(false);
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/bookmarks/${id}`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (response.data && typeof response.data.bookmarked !== 'undefined') {
        setBookmarked(response.data.bookmarked);
      } else {
        console.error('Unexpected bookmark status response:', response.data);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
      }
      console.error('Error fetching bookmark status:', err);
    }
  }, [id, token]);

  // Toggle Bookmark
  const toggleBookmark = useCallback(async () => {
    const currentToken = token || localStorage.getItem('token');
    if (!currentToken) {
      alert('Please log in to bookmark manga');
      return;
    }

    try {
      if (bookmarked) {
        await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/user/bookmarks/${id}`, {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });
      } else {
        await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/user/bookmarks`,
          { mangaId: id, mangaTitle: manga?.title, mangaImage: manga?.image },
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          }
        );
      }
      setBookmarked(!bookmarked);
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
        setToken(null);
      }
    }
  }, [bookmarked, id, token, manga]);

  // Load Manga and Chapters
  useEffect(() => {
    fetchMangaDetails();
    fetchChapters(0, sortOrder);
    fetchBookmarkStatus();
  }, [id, sortOrder, fetchMangaDetails, fetchChapters, fetchBookmarkStatus]);

  const handleLoadMore = async () => {
    if (visibleCount + 20 >= chapters.length && hasMore) {
      await fetchChapters(offset, sortOrder);
    }
    setVisibleCount(prev => prev + 20);
  };

  const toggleSortOrder = async () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    setOffset(0);
    setVisibleCount(20);
    setHasMore(true);
    setVolumes({});
    setChapters([]);
    await fetchChapters(0, newOrder);
  };

  const startReading = () => {
    if (chapters.length > 0) {
      navigate(`/read/${chapters[0].id}`);
    }
  };

  const handleVolumeClick = (vol) => {
    setActiveVolume(prev => (prev === vol ? null : vol));
  };

  const sortedChapters = [...chapters].sort((a, b) => {
    return sortOrder === 'asc' ? a.number - b.number : b.number - a.number;
  });

  // Loading/Error
  if (loading && !manga) return <div className="spinner" />;
  if (error) return <div className="error">{error}</div>;
  if (!manga) return <div className="error">Manga not found</div>;

  return (
    <div className="manga-details">
      <div className="manga-header">
        <img src={manga.image} alt={manga.title} className="manga-cover" />
        <div className="manga-meta">
          <h1>{manga.title}</h1>
          <div className="action-buttons">
            <button 
              className={`bookmark-btn ${bookmarked ? 'bookmarked' : ''}`} 
              onClick={toggleBookmark}
              disabled={!token}
            >
              {bookmarked ? '✓ Bookmarked' : '+ Add to Bookmarks'}
              {!token && <span className="tooltip">Login to bookmark</span>}
            </button>
            <button 
              className="read-btn" 
              onClick={startReading}
              disabled={chapters.length === 0}
            >
              {chapters.length > 0 ? 'Start Reading' : 'No Chapters Available'}
            </button>
          </div>
          <div className="meta-grid">
            <div><strong>Status:</strong> {manga.status}</div>
            <div><strong>Rating:</strong> {manga.averageRating ? `${manga.averageRating.toFixed(2)} (${manga.ratingCount})` : 'N/A'}</div>
            <div><strong>Year:</strong> {manga.year}</div>
            <div><strong>Language:</strong> {manga.originalLanguage}</div>
            <div><strong>Authors:</strong> {manga.authors}</div>
            <div><strong>Artists:</strong> {manga.artists}</div>
          </div>
          {manga.altTitles.length > 0 && (
            <div className="alt-titles">
              <strong>Also known as:</strong> {manga.altTitles.map(t => Object.values(t).join(', ')).join(' / ')}
            </div>
          )}
          <div className="tags">
            {Array.isArray(manga.tags) && manga.tags.length > 0
              ? manga.tags.map(tag => <span key={tag} className="tag">{tag}</span>)
              : <span>No tags available</span>}
          </div>
        </div>
      </div>

      <div className="manga-description">
        <h2>Description</h2>
        <div className={`description-text ${descExpanded ? 'expanded' : ''}`}>
          {manga.description}
        </div>
        {manga.description.length > 300 && (
          <button className="toggle-desc-btn" onClick={() => setDescExpanded(!descExpanded)}>
            {descExpanded ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>

      <div className="chapter-section">
        <div className="section-header">
          <h2>Chapters ({totalChapters})</h2>
          <button onClick={toggleSortOrder} className="sort-toggle-btn">
            {sortOrder === 'asc' ? '▼ Latest First' : '▲ Oldest First'}
          </button>
        </div>

        {Object.keys(volumes).length > 1 && (
          <div className="volume-navigation">
            <button
              className={`volume-btn ${activeVolume === null ? 'active' : ''}`}
              onClick={() => handleVolumeClick(null)}
            >
              All Chapters
            </button>
            {Object.keys(volumes).sort((a, b) => {
              if (a === 'none') return 1;
              if (b === 'none') return -1;
              return parseFloat(a) - parseFloat(b);
            }).map(vol => (
              <button
                key={vol}
                className={`volume-btn ${activeVolume === vol ? 'active' : ''}`}
                onClick={() => handleVolumeClick(vol)}
              >
                {vol === 'none' ? 'No Volume' : `Volume ${vol}`}
              </button>
            ))}
          </div>
        )}

        <div className="chapter-list">
          {sortedChapters
            .filter(chap => !activeVolume || chap.volume === activeVolume)
            .slice(0, visibleCount)
            .map(chap => (
              <Link key={chap.id} to={`/read/${chap.id}`} className="chapter-item">
                <div className="chapter-number">Chapter {chap.number || '?'}</div>
                <div className="chapter-title">{chap.title}</div>
                <div className="chapter-date">{chap.date}</div>
              </Link>
            ))}
        </div>

        {(hasMore || (activeVolume && visibleCount < chapters.filter(chap => chap.volume === activeVolume).length)) && (
          <button className="load-more-btn" onClick={handleLoadMore}>
            Load More
          </button>
        )}
      </div>

      <MangaComments mangaId={id} token={token} username={localStorage.getItem('username')} />
    </div>
  );
};

export default React.memo(MangaDetails);