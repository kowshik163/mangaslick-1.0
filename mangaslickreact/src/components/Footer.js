import React from 'react';
import { Link } from 'react-router-dom';
import './footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div id="footer-info" style={{ color: 'white', textAlign: 'center', marginTop: '40px',marginBottom:'40px' }}>
  <h2>Explore More Manga Content</h2>
  <p>
    Continue your manga journey with MangaSlick. We provide a wide selection of free manga updates and chapters
    in multiple genres such as action, romance, and fantasy. Stay updated with the latest releases and
    discover new favorites!
  </p>
</div>
      <p>© {new Date().getFullYear()} MangaSlick. All rights reserved.</p>
      <div className="footer-links">
        <Link to="/about">About</Link>
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms of Service</Link>
      </div>
    </footer>
  );
};

export default Footer;
