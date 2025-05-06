import React, { useState, useEffect } from 'react';
import './searchresult.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MangaCard from './MangaCard';
import { Helmet } from 'react-helmet';

const SearchResults = () => {
  const { query } = useParams();
  const [mangaData, setMangaData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);

        // Fetch matching manga titles
        const response = await axios.get('/api/mangadex/manga', {
          params: {
            title: query,
            limit: 20,
            includes: ['cover_art'],
          },
        });

        const mangaList = response.data.data;

        // Enrich each manga with cover image and chapters
        const updatedMangaData = await Promise.all(
          mangaList.map(async (manga) => {
            const title = manga.attributes.title?.en || 'Untitled';
            const description = manga.attributes.description?.en || 'No description available';

            const coverRel = manga.relationships.find(rel => rel.type === 'cover_art');
            const coverFile = coverRel?.attributes?.fileName;
            const image = coverFile
              ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFile}.256.jpg`
              : 'https://via.placeholder.com/256x360?text=No+Image';

            let latestChapter = null;
            let previousChapter = null;

            try {
              const chapterRes = await axios.get('/api/mangadex/chapter', {
                params: {
                  manga: manga.id,
                  limit: 2,
                  translatedLanguage: ['en'],
                  order: { chapter: 'desc' },
                },
              });

              const chapters = chapterRes.data.data;
              if (chapters.length > 0) {
                latestChapter = {
                  number: chapters[0].attributes.chapter || 'N/A',
                  chapterId: chapters[0].id,
                };
              }
              if (chapters.length > 1) {
                previousChapter = {
                  number: chapters[1].attributes.chapter || 'N/A',
                  chapterId: chapters[1].id,
                };
              }
            } catch (err) {
              console.warn(`Chapter fetch failed for ${title}`, err);
            }

            return {
              id: manga.id,
              title,
              image,
              latestChapter,
              previousChapter,
              description,
            };
          })
        );

        setMangaData(updatedMangaData);
      } catch (error) {
        console.error('Search failed:', error);
        setMangaData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="homepage">
      {/* SEO Meta Tags using Helmet */}
      <Helmet>
        <title>Search Results for: "{query}" | MangaSlick</title>
        <meta
          name="description"
          content={`Explore manga results for the search term: "${query}". Discover manga titles with the latest chapters, cover images, and more.`}
        />
        <meta property="og:title" content={`Search Results for: "${query}" | MangaSlick`} />
        <meta
          property="og:description"
          content={`Explore manga results for the search term: "${query}". Discover manga titles with the latest chapters, cover images, and more.`}
        />
        <meta
          property="og:image"
          content="https://via.placeholder.com/256x360?text=MangaSlick"
        />
        <meta name="twitter:title" content={`Search Results for: "${query}" | MangaSlick`} />
        <meta
          name="twitter:description"
          content={`Explore manga results for the search term: "${query}". Discover manga titles with the latest chapters, cover images, and more.`}
        />
        <meta
          name="twitter:image"
          content="https://via.placeholder.com/256x360?text=MangaSlick"
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": `Search Results for: "${query}" | MangaSlick`,
            "description": `Explore manga results for the search term: "${query}". Discover manga titles with the latest chapters, cover images, and more.`,
            "url": window.location.href,
            "image": "https://via.placeholder.com/256x360?text=MangaSlick",
          })}
        </script>
      </Helmet>
      <h1 className="search-results-title">Search Results for: "{query}"</h1>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="mainpage1">
          {mangaData.length > 0 ? (
            mangaData.map((manga) => (
              <div key={manga.id} className="manga-card-container">
                <MangaCard
                  id={manga.id}
                  image={manga.image}
                  title={manga.title}
                  latestChapter={manga.latestChapter}
                  previousChapter={manga.previousChapter}
                  description={manga.description}
                />
              </div>
            ))
          ) : (
            <p className="no-results">No manga found for this search.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;