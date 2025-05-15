import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { BsSearch } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './header.css';

const Header = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const navigate = useNavigate();
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    // Check if token exists in localStorage on mount
    const token = localStorage.getItem('token');
    if (token) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, []);

  // Rest of your search logic...
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length >= 2) {
        axios
          .get('/api/mangadex/manga', {
            params: {
              title: query,
              limit: 5,
              includes: ['cover_art'],
            },
          })
          .then(async (res) => {
            const mangaData = await Promise.all(
              res.data.data.map(async (manga) => {
                const title = manga.attributes.title?.en || 'Untitled';
                const coverRel = manga.relationships.find(rel => rel.type === 'cover_art');
                const coverFile = coverRel?.attributes?.fileName;
                const image = coverFile
                  ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFile}.256.jpg`
                  : 'https://via.placeholder.com/50x75?text=No+Image';

                let latestChapter = null;
                try {
                  const chapterRes = await axios.get('/api/mangadex/chapter', {
                    params: {
                      manga: manga.id,
                      limit: 1,
                      order: { chapter: 'desc' },
                    },
                  });
                  const chapter = chapterRes.data.data?.[0];
                  if (chapter) {
                    latestChapter = {
                      number: chapter.attributes.chapter || 'N/A',
                      chapterId: chapter.id,
                    };
                  }
                } catch (err) {
                  console.error('Error fetching chapter:', err);
                }

                return {
                  id: manga.id,
                  title,
                  image,
                  latestChapter,
                };
              })
            );
            setResults(mangaData);
            setShowDropdown(true);
          })
          .catch((err) => {
            console.error(err);
            setResults([]);
          });
      } else {
        setShowDropdown(false);
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      navigate(`/search/${encodeURIComponent(query.trim())}`);
      setQuery('');
      setShowDropdown(false);
    }
  };

  const toggleProfileMenu = () => setShowProfileMenu(prev => !prev);

  const handleLogout = () => {
    localStorage.removeItem('token'); // remove the token
    setLoggedIn(false);
    setShowProfileMenu(false);
    alert('Logged out!');
    navigate('/'); // redirect to home or login page if you want
  };

  return (
    <header>
      <div className="main1">
        <div className="profile" id="realimg">
          <Link to="/" title='go to home page'>
            <img src="/itislogo.jpeg" alt="mangaslick" />
          </Link>
        </div>
        <div className="header1">
          <div className="heads">
            <div className="lands">
              {/* Search */}
              <div className="search" ref={searchRef}>
                <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      if (results.length > 0) setShowDropdown(true);
                    }}
                    onFocus={() => {
                      if (results.length > 0) setShowDropdown(true);
                    }}
                    placeholder="  search for manga"
                  />
                  <button className="search-btn" type="submit" title='submit search'>
                    <BsSearch size={18} />
                  </button>

                  {showDropdown && results.length > 0 && (
                    <ul className="search-dropdown">
                      {results.map((item) => (
                        <li key={item.id}>
                          <div className="search-result-item">
                            <Link
                              to={`/manga/${item.id}`}
                              onClick={() => {
                                setQuery('');
                                setShowDropdown(false);
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              <img src={item.image} alt={item.title} referrerPolicy='no-referrer'/>
                            </Link>
                            <div>
                              <Link
                                to={`/manga/${item.id}`}
                                onClick={() => {
                                  setQuery('');
                                  setShowDropdown(false);
                                }}
                                style={{ display: 'flex', gap: '10px', alignItems: 'center', textDecoration: 'none', marginBottom: '5px' }} title={`Go to ${item.title} page`} >
                                <div>
                                  <div style={{ fontWeight: 'bold', height: '30%', cursor: 'pointer', marginBottom: '10px' }}>{item.title}</div>
                                </div>
                              </Link>

                              {item.latestChapter ? (
                                <Link
                                  to={`/read/${item.latestChapter.chapterId}`}
                                  onClick={() => setShowDropdown(false)}
                                  style={{
                                    fontSize: '16px',
                                    textDecoration: 'none',
                                    display: 'block',
                                    cursor: 'pointer',
                                    color: 'rgb(30, 44, 73)',
                                  }}
                                  title={`Read Chapter ${item.latestChapter.number}`}
                                >
                                  Latest: Chapter {item.latestChapter.number}
                                </Link>
                              ) : (
                                <div style={{ fontSize: '16px', color: '#aaa', cursor: 'pointer' }}>No chapters</div>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </form>
              </div>

              {/* Profile Menu */}
              {loggedIn && (
                <div className="profile-menu-container" ref={profileRef}>
                  <FaUserCircle
                    className="profile-icon"
                    size={30}
                    onClick={toggleProfileMenu}
                  />
                  {showProfileMenu && (
                    <ul className="profile-dropdown show">
                      <li><Link to="/profile" onClick={() => setShowProfileMenu(false)}>Profile / Account</Link></li>
                      <li><Link to="/bookmarks" onClick={() => setShowProfileMenu(false)}>Bookmarks</Link></li>
                      <li onClick={handleLogout}>Log Out</li>
                    </ul>
                  )}
                </div>
              )}
           
              {/* If NOT logged in, show Log in and Sign up buttons */}
              {!loggedIn && (
                <div className="profile-menu-container" ref={profileRef}>
                  <FaUserCircle
                    className="profile-icon"
                    size={30}
                    onClick={toggleProfileMenu}
                     title="Open Profile Menu"
                  />
                  {showProfileMenu && (
                    <ul className="profile-dropdown show">
                      <li><Link to="/login" onClick={() => setShowProfileMenu(false)}>Log In</Link></li>
                      <li><Link to="/signup" onClick={() => setShowProfileMenu(false)}>Sign Up</Link></li>
                    </ul>
                  )}
                </div>
              )}

            </div>
          </div>
          <hr />

          {/* Navigation */}
          <div className="list1">
            <nav>
              <ul>
                <div className="lh1"><Link to="/">Home</Link></div>
                <div className="lh1"><Link to="/genre/manga">manga</Link></div>
                <div className="lh1"><Link to="/genre/manhwa">manhwa</Link></div>
                <div className="lh1"><Link to="/genre/manhua">manhua</Link></div>
                <div className="lh1"><Link to="/Community">Community Picks</Link></div>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
