import React from 'react';
import { useEffect } from 'react';
const TermsOfService = () => {
    useEffect(() => {
      
      document.title = "Terms Of Policy | Mangaslick"; // Set custom tab name here
      return () => {
        document.title = "Mangaslick"; // Reset to default when leaving this page
      };
    }, []);
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Terms of Service</h1>

      <p>
        Welcome to <strong>MangaVerse</strong>. By accessing or using our website and services, you agree to the following terms and conditions. 
        Please read them carefully. If you do not agree to these terms, you may not use our platform.
      </p>

      <h2 style={{ marginTop: '2rem', fontSize: '1.8rem' }}>📌 Use of Service</h2>
      <ul>
        <li>The content provided on MangaVerse is for personal, non-commercial use only.</li>
        <li>You agree not to copy, reproduce, modify, distribute, transmit, or create derivative works from our content without explicit permission.</li>
        <li>Automated access (e.g., bots or scrapers) is prohibited unless authorized.</li>
      </ul>

      <h2 style={{ marginTop: '2rem', fontSize: '1.8rem' }}>🧑‍⚖️ User Conduct</h2>
      <ul>
        <li>Respect other users. Harassment, hate speech, or abusive behavior will not be tolerated.</li>
        <li>You are responsible for your own account activity and content you post.</li>
        <li>Do not upload or share any illegal, infringing, or harmful material.</li>
      </ul>

      <h2 style={{ marginTop: '2rem', fontSize: '1.8rem' }}>📚 Content and Copyright</h2>
      <p>
        MangaVerse may display manga content and metadata sourced from external public APIs such as MangaDex. 
        We do not host or own any manga scans or licensed material. 
        If you are a rights holder and wish for content to be removed, please contact us immediately.
      </p>

      <h2 style={{ marginTop: '2rem', fontSize: '1.8rem' }}>🛠️ Changes to the Terms</h2>
      <p>
        MangaVerse reserves the right to update or change these Terms of Service at any time. 
        Continued use of the site after changes implies acceptance of the updated terms.
      </p>

      <h2 style={{ marginTop: '2rem', fontSize: '1.8rem' }}>📬 Contact Us</h2>
      <p>
        For questions about these terms, please reach out to us at mangaslick@gmail.com.
      </p>
    </div>
  );
};

export default TermsOfService;
