import React from 'react';
import './mangacard.css';
import { Link } from 'react-router-dom';

const MangaCard = ({ image, title, latestChapters = [], description, id }) => {
  return (
    <div className="m1">
      <div className="m1img">
        <Link to={`/manga/${id}`}>
          <img src={image} alt={title} loading='eager' referrerPolicy='no-referrer'/>
        </Link>
      </div>

      <div className="m1para">
        <div className='m1title'>
          <Link to={`/manga/${id}`}>{title}</Link>
        </div>

        <hr />

        <div className="chapters">
          {/* Render the latest 3 chapters */}
          {latestChapters.length > 0 ? (
            latestChapters.map((chapter, index) => (
              chapter.chapterId ? (
                <Link
                key={chapter.chapterId}
                to={`/read/${chapter.chapterId}`}
                className="chapter-link"
                style={{
                  color: '#007bff',
                  fontSize: '16px',
                  textDecoration: 'none',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                Chapter {chapter.number || 'N/A'}
              </Link>
              
              ) : (
                <p key={index}>Chapter {chapter.number || 'N/A'}</p>
              )
            ))
          ) : (
            <p>No chapters available</p>
          )}
        </div>

        <div className="m1para1">{description}</div>
      </div>
    </div>
  );
};

export default MangaCard;