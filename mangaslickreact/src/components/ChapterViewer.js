// components/ChapterViewer.js
import React, { useEffect, useState } from 'react';
import './chapterviewer.css';
import { useParams } from 'react-router-dom';

const ChapterViewer = () => {
  const { id, chapterId } = useParams(); // Get manga and chapter IDs from the URL
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    const fetchChapterUrl = async () => {
      try {
        // Assuming the PDF URL is generated based on manga id and chapter id
        const url = `https://mangadex.org/chapter/${id}`; // Or you could use an API to fetch the URL
        setPdfUrl(url);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch chapter URL:', error);
      }
    };

    fetchChapterUrl();
  }, [id, chapterId]);

  if (loading) return <p>Loading chapter...</p>;

  return (
    <div className="chapter-viewer">
      <h1>Viewing Chapter {chapterId}</h1>
      {/* Render the PDF or Manga Images here */}
      <iframe
        src={pdfUrl}
        width="100%"
        height="600px"
        title={`Manga Chapter ${chapterId}`}
      >
        <p>Your browser does not support iframes.</p>
      </iframe>
    </div>
  );
};

export default ChapterViewer;
