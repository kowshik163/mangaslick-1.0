import React from 'react';
import { Link } from 'react-router-dom';
import './footer.css';

const Footer = () => {
  return (
    <footer className="footer">
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
