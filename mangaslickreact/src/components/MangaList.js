import React, { useState, useEffect } from 'react';
import {Helmet} from 'react-helmet';
import './mangalist.css';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MangaCard from './MangaCard';
axios.defaults.baseURL = 'https://backend-production-0226e.up.railway.app';
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
    if (mangaData.length > 0) {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `Manga List - Page ${page}`,
        "url": window.location.href,
        "itemListElement": mangaData.map((manga, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": `https://yourwebsite.com/manga/${manga.id}`,
          "name": manga.title,
          "image": manga.image,
        })),
      };
  
      // Trigger a custom event to add structured data
      window.dispatchEvent(new CustomEvent('structuredData', { detail: structuredData }));
    }
  }, [mangaData, page]);
  
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
  
        const response = await axios.get('/api/mangadex/manga', {
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
     <Helmet>
  {/* Canonical URL */}
  {page === 1 ? (
    <link rel="canonical" href="https://mangaslick.vercel.app/" />
  ) : (
    <link
      rel="canonical"
      href={`https://mangaslick.vercel.app${type ? `/genre/${type}/page/${page}` : `/page/${page}`}`}
    />
  )}

  {/* Pagination meta tags */}
  {page > 1 && (
    <link
      rel="prev"
      href={`https://mangaslick.vercel.app${type ? `/genre/${type}/page/${page - 1}` : `/page/${page - 1}`}`}
    />
  )}
 {hasMore && (
  <link
    rel="next"
    href={`https://mangaslick.vercel.app${type ? `/genre/${type}/page/${page + 1}` : `/page/${page + 1}`}`}
  />
)}
  {/* Meta Title and Description */}
  <title>
    {page === 1
      ? 'Read Manga Online for Free | Latest Manga Updates | MangaSlick'
      : `${type ? `${type.charAt(0).toUpperCase() + type.slice(1)} Manga - Page ${page}` : `Latest Manga - Page ${page}`} | MangaSlick`}
  </title>
  <meta
    name="description"
    content={
      page === 1
        ? 'Read the latest manga updates for free online. Discover trending manga, new chapters, and hidden gems — all in high quality on MangaSlick.'
        : `Explore the latest ${type || ''} manga on page ${page}. Continue reading new manga updates online for free.`
    }
  />

  {/* Open Graph Tags */}
  <meta
    property="og:title"
    content={
      type
        ? `${type.charAt(0).toUpperCase() + type.slice(1)} Manga - Page ${page}`
        : `Latest Manga - Page ${page}`
    }
  />
  <meta
    property="og:description" content={`Explore the latest ${type || ''} manga on page ${page}.`} />
  <meta property="og:image" content="https://via.placeholder.com/256x360?text=No+Image"/>
  <meta property="og:url" content={`https://mangaslick.vercel.app${type ? `/genre/${type}/page/${page}` : `/page/${page}`}`} />
  <meta property="og:site_name" content="MangaSlick" />
  {/* Web App Metadata */}
  <meta name="application-name" content="MangaSlick" />
  {/* JSON-LD Schema */}
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "MangaSlick",
      alternateName: "Manga Slick",
      url: "https://mangaslick.vercel.app"
    })}
  </script>
</Helmet>

{page === 1 && (
<div style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>
  <h2>Read Manga Online for Free</h2>
  <p>
    Discover the latest manga updates and trending titles, all available to read for free.
    Browse high-quality manga chapters in genres like action, romance, and adventure — only on MangaSlick.
    <a href="#footer-info" style={{ color: '#4CAF50' }}>Learn more in the footer</a> 
  </p>
</div>
)}
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
