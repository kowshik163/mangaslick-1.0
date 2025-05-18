import React, { useEffect, useState, useCallback,useRef } from 'react';
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
  const [adLoaded, setAdLoaded] = useState(false);
  const adRef = useRef(null);
  // Apply theme to body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch all chapters and manga data
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
        const index = uniqueChapters.findIndex(ch => ch.id === chapterId);
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

  // Load pages for current chapter
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

  // Navigation between chapters
  const goToChapter = useCallback((index) => {
    if (index >= 0 && index < chapters.length) {
      navigate(`/read/${chapters[index].id}`);
    }
  }, [chapters, navigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToChapter(currentChapterIndex - 1);
      if (e.key === 'ArrowRight') goToChapter(currentChapterIndex + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapterIndex, goToChapter]);

  // Scroll to top when chapter changes
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Set document title
  useEffect(() => {
    if (manga && currentChapterIndex >= 0 && chapters[currentChapterIndex]) {
      const currentChapter = chapters[currentChapterIndex];
      const chapterNum = currentChapter?.attributes?.chapter || 'Oneshot';
      const title = manga?.attributes?.title?.en || 'Manga';
      document.title = `${title} - Chapter ${chapterNum} | Mangaslick`;
    }
  }, [manga, currentChapterIndex, chapters]);

  // Load Adsterra ad
  useEffect(() => {
    if (adLoaded || !adRef.current) return;

    // Check if script is already in the DOM
    if (document.getElementById("adsterra-script")) {
      setAdLoaded(true);
      return;
    }

    // Create ad options BEFORE script loads
    window.atOptions = {
      key: '2d4f7847e8c5e3a39d84cb0a47fdd289',
      format: 'iframe',
      height: 300,
      width: 160,
      params: {}
    };

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "//www.highperformanceformat.com/2d4f7847e8c5e3a39d84cb0a47fdd289/invoke.js";
    script.async = true;
    script.id = "adsterra-script";

    adRef.current.innerHTML = ""; // Ensure container is clean
    adRef.current.appendChild(script);
    setAdLoaded(true);
  }, [adLoaded]);
useEffect(() => {
    if (adLoaded || !adRef.current) return;

    // Check if script is already in the DOM
    if (document.getElementById("adsterra-script2")) {
      setAdLoaded(true);
      return;
    }

    // Create ad options BEFORE script loads
    window.atOptions = {
      key: '174c2dbc4aed0e2c51eb66cfb07fae0f',
      format: 'iframe',
      height: 600,
      width: 160,
      params: {}
    };

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "//www.highperformanceformat.com/174c2dbc4aed0e2c51eb66cfb07fae0f/invoke.js";
    script.async = true;
    script.id = "adsterra-script2";

    adRef.current.innerHTML = ""; // Ensure container is clean
    adRef.current.appendChild(script);
    setAdLoaded(true);
  }, [adLoaded]);
  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const currentChapter = chapters[currentChapterIndex];
  const chapterNumber = currentChapter?.attributes?.chapter || 'Oneshot';
  const chapterTitle = currentChapter?.attributes?.title;
  const mangaTitle = manga?.attributes?.title?.en || 'Manga';

  return (
    <div className={`reader-container ${theme}`}>
      <Helmet>
        <title>{`${mangaTitle} - Chapter ${chapterNumber} | MangaSlick`}</title>
        <meta name="description" content={`${mangaTitle} - Chapter ${chapterNumber}. Read manga online at MangaSlick.`} />
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
            <button 
              onClick={() => goToChapter(currentChapterIndex - 1)} 
              disabled={currentChapterIndex === 0}
            >
              ◀ Prev
            </button>
            <select 
              value={currentChapterIndex}
              onChange={(e) => goToChapter(parseInt(e.target.value))}
            >
              {chapters.map((ch, index) => (
                <option key={ch.id} value={index}>
                  {ch.attributes.chapter ? `Chapter ${ch.attributes.chapter}` : 'Oneshot'}
                </option>
              ))}
            </select>
            <button 
              onClick={() => goToChapter(currentChapterIndex + 1)} 
              disabled={currentChapterIndex === chapters.length - 1}
            >
              Next ▶
            </button>
          </div>

          <div className="reader-settings">
            <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>
              <i className="settings-icon">⚙️</i>
            </button>
            {showSettings && (
              <div className="settings-dropdown">
                <label> Reading Mode: </label>
                <button 
                  className="setting-button" 
                  onClick={() => setReadingMode(readingMode === 'vertical' ? 'page' : 'vertical')}
                >
                  {readingMode === 'vertical' ? 'Vertical' : 'Page'}
                </button>
                <label> Theme: </label>
                <button 
                  className="setting-button" 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ad Container - Centered with proper dimensions */}
      <div className="ad-container">
        <div 
          id="adsterra-ad" 
          style={{ 
            width: '200px', 
            height: '350px',
            margin: '0 auto',
            position: 'relative',
          }} 
        />
      </div>

      <div className={`manga-pages ${readingMode}`}>
        {pages.map((url, i) => (
          <img 
            key={i} 
            src={url} 
            alt={`Page ${i + 1}`} 
            loading="lazy" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        ))}
      </div>
  <div className="ad-container">
        <div 
          id="adsterra-ad" 
          style={{ 
            width: '200px', 
            height: '350px',
            margin: '0 auto',
            position: 'relative',
          }} 
        />
      </div>
      <div className="bottom-controls">
        <button onClick={() => goToChapter(currentChapterIndex - 1)} disabled={currentChapterIndex === 0}>
          ◀ Prev
        </button>
        <select 
          value={currentChapterIndex}
          onChange={(e) => goToChapter(parseInt(e.target.value))}
        >
          {chapters.map((ch, index) => (
            <option key={ch.id} value={index}>
              {ch.attributes.chapter ? `Chapter ${ch.attributes.chapter}` : 'Oneshot'}
            </option>
          ))}
        </select>
        <button 
          onClick={() => goToChapter(currentChapterIndex + 1)} 
          disabled={currentChapterIndex === chapters.length - 1}
        >
          Next ▶
        </button>
      </div>

      <button className="go-to-top" onClick={scrollToTop}>
        <i className="go-top-icon">↑</i>
      </button>
       <h2 className="manga-title" style={{width:'100%'}}>
          <Link to="/" className="site-name">MangaSlick</Link> &gt;&nbsp;
          <span className="chapter-title clickable" onClick={() => goToChapter(currentChapterIndex)}>
            {chapterTitle ? `${chapterTitle} (Chapter ${chapterNumber})` : `Chapter ${chapterNumber}`}
          </span>
        </h2>
    </div>
  );
};

export default MangaReader;