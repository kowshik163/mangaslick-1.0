import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './comments.css';

const MangaComments = ({ mangaId, token: propToken, username }) => {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use both prop token and check localStorage as fallback
  const token = propToken || localStorage.getItem('token');

  useEffect(() => {
    const fetchComments = async () => {
      try {  
        const response = await axios.get(
          `https://backend-production-0226e.up.railway.app/api/${mangaId}/comments`,
          {
            headers:{
            // withCredentials: false
            'Content-Type': 'application/json',}
          }
        );

        if (response.data?.success && Array.isArray(response.data.comments)) {
          setComments(response.data.comments);
        } else {
          setComments([]);
          console.error('Unexpected format:', response.data);
        }
      } catch (err) {
        console.error('Error loading comments:', err.message);
        setComments([]);
      }
    };
  
    fetchComments();
  }, [mangaId]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    console.debug('Submission debug:', {
      inputLength: input.trim().length,
      tokenPresent: !!token,
      tokenValue: token ? `${token.substring(0, 10)}...` : 'none'
    });

    if (!input.trim()) {
      alert("Comment cannot be empty!");
      setIsSubmitting(false);
      return;
    }

    if (!token) {
      alert("Please log in to comment");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/${mangaId}/comments`,
        { text: input },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (res.data && res.data._id) {
        setComments(prev => [...prev, res.data]);
        setInput('');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error("Submission error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });

      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem('token');
      } else {
        alert(`Failed to post comment: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (id) => {
    if (!token) {
      alert("Please log in to like comments");
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/${mangaId}/comments/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setComments(prev => prev.map(c => 
        c._id === id ? { ...c, likes: res.data.likes } : c
      ));
    } catch (err) {
      console.error("Like error:", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
      }
    }
  };

  const handleReply = async (id) => {
    if (!token) {
      alert("Please log in to reply");
      return;
    }

    const replyText = prompt('Enter your reply:');
    if (!replyText?.trim()) return;

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/${mangaId}/comments/${id}/reply`,
        { text: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setComments(prev => prev.map(c => 
        c._id === id ? { ...c, replies: res.data.replies } : c
      ));
    } catch (err) {
      console.error("Reply error:", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
      }
    }
  };

  return (
    <div className="comments-section">
      <h2>💬 Comments on this Manga</h2>
      
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Share your thoughts..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSubmitting}
          required
        />
        <button 
          type="submit" 
          disabled={isSubmitting || !input.trim()}
        >
          {isSubmitting ? 'Posting...' : 'Comment'}
        </button>
      </form>

      <ul>
        {Array.isArray(comments) ? (
          comments.length > 0 ? (
            comments.map((comment) => (
              <li key={comment._id}>
                <div className="comment-box">
                  <p><strong>{comment.username}</strong>:</p>
                  <p>{comment.text}</p>
                  <div className="comment-actions">
                    <button 
                      onClick={() => handleLike(comment._id)}
                      disabled={!token}
                    >
                      Like ({comment.likes || 0})
                    </button>
                    <button 
                      onClick={() => handleReply(comment._id)}
                      disabled={!token}
                    >
                      Reply
                    </button>
                  </div>
                  {comment.replies?.length > 0 && (
                    <div className="replies">
                      {comment.replies.map((reply, i) => (
                        <div key={`${comment._id}-reply-${i}`} className="reply-box">
                          <p><strong>{reply.username}</strong>:</p>
                          <p>{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <small>{new Date(comment.time).toLocaleString()}</small>
              </li>
            ))
          ) : (
            <p>No comments yet. Be the first to comment!</p>
          )
        ) : (
          <p>Loading comments...</p>
        )}
      </ul>
    </div>
  );
};

export default React.memo(MangaComments);