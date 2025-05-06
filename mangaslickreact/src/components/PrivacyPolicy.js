import React from 'react';
import { useEffect } from 'react';
const PrivacyPolicy = () => {
  useEffect(() => {
      
      document.title = "Privacy Policy  | Mangaslick"; // Set custom tab name here
      return () => {
        document.title = "Mangaslick"; // Reset to default when leaving this page
      };
    }, []);
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Privacy Policy</h1>
      
      <p>
        Your privacy is important to us at <strong>MangaVerse</strong>. This Privacy Policy outlines how we collect, use, and protect your information when you interact with our website and services.
      </p>

      <h2 style={{ marginTop: '2rem', fontSize: '1.8rem' }}>🔍 Information We Collect</h2>
      <ul>
        <li><strong>Account Information:</strong> When you sign up, we may collect basic information such as your username and email address.</li>
        <li><strong>Usage Data:</strong> We may track how you interact with our platform (e.g., bookmarks, comments, or reading history) to improve your experience.</li>
        <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to personalize content, remember preferences, and enhance usability.</li>
      </ul>

      <h2 style={{ marginTop: '2rem', fontSize: '1.8rem' }}>🔐 How We Use Your Information</h2>
      <p>
        Any data we collect is used solely to provide and improve our services. We do <strong>not</strong> sell, rent, or share your personal information with third parties for marketing purposes.
      </p>

      <h2 style={{ marginTop: '2rem', fontSize: '1.8rem' }}>🛡️ Data Security</h2>
      <p>
        We implement industry-standard measures to safeguard your data. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.
      </p>

      <h2 style={{ marginTop: '2rem', fontSize: '1.8rem' }}>🎂 Children’s Privacy</h2>
      <p>
        MangaVerse is not intended for users under the age of 13. We do not knowingly collect personal information from children under this age.
      </p>

      <h2 style={{ marginTop: '2rem', fontSize: '1.8rem' }}>🌍 Third-Party Services</h2>
      <p>
        Our platform may include content or links from third-party sites such as MangaDex. We are not responsible for their privacy practices, and we encourage users to review those policies separately.
      </p>

      <h2 style={{ marginTop: '2rem', fontSize: '1.8rem' }}>✉️ Contact Us</h2>
      <p>
        If you have any questions or concerns about this Privacy Policy or how your data is handled, please contact us via our support form or at mangaslick@gmail.com.
      </p>

      <p style={{ marginTop: '2rem', fontStyle: 'italic' }}>
        This policy may be updated periodically. Continued use of the site after changes implies acceptance of the revised policy.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
