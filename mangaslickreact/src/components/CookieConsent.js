import React, { useState, useEffect } from 'react';
import './CookieConsent.css'; // Optional: for styling

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent">
      <p>We use cookies to enhance your experience. By continuing, you agree to our cookie policy.</p>
      <button onClick={handleAccept}>Accept</button>
    </div>
  );
};

export default CookieConsent;
