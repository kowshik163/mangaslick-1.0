import React from 'react';
import { useEffect } from 'react';
import {Helmet} from 'react-helmet';
const About = () => {
   useEffect(() => {
          
          document.title = "About | Mangaslick"; // Set custom tab name here
          return () => {
            document.title = "Mangaslick"; // Reset to default when leaving this page
          };
        }, []);
  return (
    <>
      <Helmet>
        <meta name="description" content="Discover Mangaslick - your ultimate manga reading platform with thousands of titles, a clean interface, bookmarks, and a vibrant community." />
        <meta name="keywords" content="manga, manga reader, manga platform, manga library, manga community, manga reader interface, manga bookmarks" />
        <meta name="robots" content="index, follow" />
      </Helmet>
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>About MangaVerse</h1>
      <p>
        <strong>MangaVerse</strong> is your ultimate destination for discovering, reading, and enjoying manga across all genres and styles. 
        Whether you're a casual reader or a dedicated otaku, MangaVerse offers a powerful, beautifully designed platform to enhance your manga reading experience.
      </p>

      <h2 style={{ marginTop: '2rem', fontSize: '1.8rem' }}>🌟 What We Offer</h2>
      <ul>
        <li><strong>Extensive Library:</strong> Thousands of manga titles across genres like action, romance, fantasy, horror, slice-of-life, and more.</li>
        <li><strong>Clean Reader Interface:</strong> Enjoy seamless reading with customizable themes (light/dark), reading modes (paged/vertical), and smooth navigation.</li>
        <li><strong>Bookmarks & History:</strong> Keep track of your favorite titles and continue reading where you left off.</li>
        <li><strong>Comments & Community:</strong> Engage in discussions, post reactions, and reply to others on manga chapters and titles.</li>
        <li><strong>Filter & Search:</strong> Powerful filters to browse manga by genre, author, publication date, language, and more.</li>
      </ul>

      <h2 style={{ marginTop: '2rem', fontSize: '1.8rem' }}>💡 Our Mission</h2>
      <p>
        At MangaVerse, we aim to create a centralized hub for manga lovers around the world. 
        We believe in an accessible and smooth reading experience, backed by real-time updates, performance-driven design, and a welcoming community.
      </p>

      <h2 style={{ marginTop: '2rem', fontSize: '1.8rem' }}>🔧 Powered By</h2>
      <p>
        MangaVerse leverages the <a href="https://api.mangadex.org" target="_blank" rel="noopener noreferrer">MangaDex API</a> for high-quality and up-to-date manga data. 
        Our backend is powered by modern technologies such as Express.js, MongoDB, and Redis, and hosted on scalable platforms like Railway and Vercel.
      </p>

      <h2 style={{ marginTop: '2rem', fontSize: '1.8rem' }}>📬 Contact Us</h2>
      <p>
        Have questions, suggestions, or feedback? We'd love to hear from you. Reach out via our support page or connect with us on social media.
      </p>
    </div></>
  );
};

export default About;
