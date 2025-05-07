import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './MangaReader.css';
import { Helmet } from 'react-helmet';

const MangaReader = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();

  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(-1);
  const [pages, setPages] = useState([]);
  const [readingMode, setReadingMode] = useState('vertical');
  const [theme, setTheme] = useState('dark');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [manga, setManga] = useState(null);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchAllChapters = async (mangaId) => {
      let allChapters = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      try {
        while (hasMore) {
          const res = await axios.get(`/api/mangadex/chapter`, {
            params: {
              manga: mangaId,
              translatedLanguage: ['en'],
              order: { chapter: 'asc' },
              limit,
              offset,
            },
          });

          const data = res.data.data;
          allChapters = [...allChapters, ...data];
          offset += limit;
          hasMore = data.length === limit;
        }
      } catch (err) {
        console.error('Failed to fetch all chapters:', err);
        setError('Failed to fetch all chapters.');
      }

      return allChapters;
    };

    const fetchChapterData = async () => {
      try {
        setLoading(true);
        setError('');

        const chapterRes = await axios.get(`/api/mangadex/chapter/${chapterId}`);
        const mangaRel = chapterRes.data.data.relationships.find(rel => rel.type === 'manga');
        const mangaId = mangaRel.id;

        const mangaRes = await axios.get(`/api/mangadex/manga/${mangaId}`);
        setManga(mangaRes.data.data);

        const chaptersList = await fetchAllChapters(mangaId);
       // Remove duplicates by chapter number (keeping the first occurrence)
const uniqueChapters = [];
const seen = new Set();

for (const ch of chaptersList) {
  const chNum = ch.attributes.chapter || 'Oneshot';
  if (!seen.has(chNum)) {
    seen.add(chNum);
    uniqueChapters.push(ch);
  }
}

setChapters(uniqueChapters);


        const index = chaptersList.findIndex(ch => ch.id === chapterId);
        setCurrentChapterIndex(index !== -1 ? index : 0);
      } catch (err) {
        console.error('Error fetching chapter data:', err);
        setError('Failed to load chapters.');
      } finally {
        setLoading(false);
      }
    };

    fetchChapterData();
  }, [chapterId]);

  useEffect(() => {
    const loadPages = async () => {
      if (!chapters.length || currentChapterIndex < 0 || currentChapterIndex >= chapters.length) return;

      const chapter = chapters[currentChapterIndex];
      try {
        const res = await axios.get(`/api/mangadex/at-home/server/${chapter.id}`);
        const { baseUrl, chapter: chapterData } = res.data;

        const pageUrls = chapterData.data.map(page =>
          `${baseUrl}/data/${chapterData.hash}/${page}`
        );
        setPages(pageUrls);
      } catch (error) {
        console.error("Failed to load pages:", error);
        setError('Failed to load pages. Please try again later.');
      }
    };

    loadPages();
  }, [currentChapterIndex, chapters]);

  const goToChapter = useCallback((index) => {
    if (index >= 0 && index < chapters.length) {
      navigate(`/read/${chapters[index].id}`);
    }
  }, [chapters, navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToChapter(currentChapterIndex - 1);
      if (e.key === 'ArrowRight') goToChapter(currentChapterIndex + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapterIndex, goToChapter]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentChapter = chapters[currentChapterIndex];
  const chapterNumber = currentChapter?.attributes?.chapter || 'Oneshot';
  const chapterTitle = currentChapter?.attributes?.title;

  useEffect(() => {
    if (manga && currentChapter) {
      const chapterNum = currentChapter?.attributes?.chapter || 'Oneshot';
      const title = manga?.attributes?.title?.en || 'Manga';
      document.title = `${title}-Chapter ${chapterNum}|Mangaslick`;
    }
  }, [manga, currentChapter]);

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className={`reader-container ${theme}`}>
      <Helmet>
        <title>{`${manga?.attributes?.title?.en || 'Manga'} - Chapter ${chapterNumber} | MangaSlick`}</title>
        <meta name="description" content={`${manga?.attributes?.title?.en || 'Manga'} - Chapter ${chapterNumber}. Read manga online at MangaSlick.`} />
      </Helmet>

      <div className="manga-logo">
        <Link to="/">
          <img src="/itislogo.jpeg" alt="mangaslick" />
        </Link>
      </div>

      <div className="reader-controls">
        <h2 className="manga-title">
          <Link to="/" className="site-name">MangaSlick</Link> &gt;&nbsp;
          <span className="chapter-title clickable" onClick={() => goToChapter(currentChapterIndex)}>
            {chapterTitle ? `${chapterTitle} (Chapter ${chapterNumber})` : `Chapter ${chapterNumber}`}
          </span>
        </h2>
        <div className="chapter-nav-container">
          <div className="chapter-nav">
            <button onClick={() => goToChapter(currentChapterIndex - 1)} disabled={currentChapterIndex === 0}>◀ Prev</button>
            <select style={{ width: '120px' }}
              value={currentChapterIndex}
              onChange={(e) => goToChapter(parseInt(e.target.value))}
            >
              {chapters.map((ch, index) => (
                <option key={ch.id} value={index}>
                  {ch.attributes.chapter ? `Chapter ${ch.attributes.chapter}` : 'Oneshot'}
                </option>
              ))}
            </select>
            <button onClick={() => goToChapter(currentChapterIndex + 1)} disabled={currentChapterIndex === chapters.length - 1}>Next ▶</button>
          </div>

          <div className="reader-settings">
            <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>
              <i className="settings-icon">⚙️</i>
            </button>
            {showSettings && (
              <div className="settings-dropdown">
                <label> Reading Mode: </label>
                <button className="setting-button" onClick={() => setReadingMode(readingMode === 'vertical' ? 'page' : 'vertical')}>
                  {readingMode === 'vertical' ? 'Vertical' : 'Page'}
                </button>
                <label> Theme: </label>
                <button className="setting-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`manga-pages ${readingMode}`}>
        {pages.map((url, i) => (
          <img key={i} src={url} alt={`Page ${i + 1}`} loading="lazy" />
        ))}
      </div>

      <div className="bottom-controls">
        <button onClick={() => goToChapter(currentChapterIndex - 1)} disabled={currentChapterIndex === 0}>◀ Prev</button>
        <select style={{ width: '120px' }}
          value={currentChapterIndex}
          onChange={(e) => goToChapter(parseInt(e.target.value))}
        >
          {chapters.map((ch, index) => (
            <option key={ch.id} value={index}>
              {ch.attributes.chapter ? `Chapter ${ch.attributes.chapter}` : 'Oneshot'}
            </option>
          ))}
        </select>
        <button onClick={() => goToChapter(currentChapterIndex + 1)} disabled={currentChapterIndex === chapters.length - 1}>Next ▶</button>
      </div>

      <button className="go-to-top" onClick={scrollToTop}>
        <i className="go-top-icon">↑</i>
      </button>
    </div>
  );
};

export default MangaReader;
