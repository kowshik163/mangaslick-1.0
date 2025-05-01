import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './reset.css';

// import { GoogleOAuthProvider } from '@react-oauth/google';
import Header from './components/Header';
import GenreList from './components/GenreList';
import TrendingManga from './components/TrendingManga';
import MangaList from './components/MangaList';
import MangaDetails from './components/MangaDetails';
import Footer from './components/Footer';
import SearchResults from './components/SearchResults';
import Login from './components/Login';
import Signup from './components/Signup';
import GlobalComments from './components/GlobalComments';
import MangaReader from './components/MangaReader';
import Bookmarks from './components/Bookmarks';
import CookieConsent from './components/CookieConsent.js'; // added

// New Pages
import About from './components/About';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsofService';
import Profile from './components/Profile'; // Import the Profile component

const AppWrapper = () => {
  const location = useLocation();
  const [currentFilters] = useState({});

  const FilteredMangaSection = (
    <>
      <GenreList />
      <TrendingManga />
      <div className='flexColumn' style={{ display: 'flex', alignItems: 'flex-start' }}>
        <MangaList filters={currentFilters} />
      </div>
      <GlobalComments />
    </>
  );

  // Hide layout on login, signup, and manga reader pages
  const hideLayout = ['/login', '/signup'].includes(location.pathname) || location.pathname.startsWith('/read/');

  return (
    <>
      {!hideLayout && <Header />}

      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={FilteredMangaSection} />
        <Route path="/page/:pageNum" element={FilteredMangaSection} />
        <Route path="/genre/:type" element={FilteredMangaSection} />
        <Route path="/genre/:type/page/:pageNum" element={FilteredMangaSection} />
        <Route path="/manga/:id" element={<MangaDetails />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/profile" element={<Profile />} /> {/* Add the profile route here */}
        <Route
          path="/search/:query"
          element={
            <>
              <GenreList />
              <TrendingManga />
              <SearchResults />
            </>
          }
        />
        <Route path="/read/:chapterId" element={<MangaReader />} />
        
        {/* New Static Pages */}
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>

      {!hideLayout && (
        <>
          <Footer />
          <CookieConsent />
        </>
      )}
    </>
  );
};

const App = () => {
  return (
    // <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <Router>
        <AppWrapper />
      </Router>
    // </GoogleOAuthProvider>
  );
};

export default App;
