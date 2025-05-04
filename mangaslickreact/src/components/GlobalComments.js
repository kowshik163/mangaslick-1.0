import React, { useState, useEffect } from 'react';
import './comments.css';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Import jwt-decode to check token expiration

const GlobalComments = () => {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState('');
  const [likedComments, setLikedComments] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyInput, setReplyInput] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const username = user?.username || 'Anonymous';

  // Function to check if the token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Get current time in seconds
    return decoded.exp < currentTime; // Return true if the token is expired
  };

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
  
      // Only attach Authorization header if token is valid
      if (token && !isTokenExpired(token)) {
        headers['Authorization'] = `Bearer ${token}`;
      }
  
      const response = await axios.get(`https://backend-production-0226e.up.railway.app/api/comments`, {
        headers,
        withCredentials: true
      });
  
      if (response.data?.success && Array.isArray(response.data.comments)) {
        setComments(response.data.comments);
      } else {
        setComments([]);
        console.error('Unexpected format:', response.data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err.message);
      // alert('Failed to load comments.');
    }
  };
    
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const token = localStorage.getItem('token');
      // console.log('Token being passed:', token);
      if (!token || isTokenExpired(token)) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '/login'; // Redirect to login page
        return;
      }
      // console.log('Token being passed:', token);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/comments`,
        { text: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '/login'; // Redirect to login page
        return;
      }
  
      setComments((prev) => [response.data, ...prev]);
      setInput('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Error posting comment. Please try again later.');
    }
  };
  

  const handleLike = (index) => {
    const updatedComments = [...comments];
    const updatedLikedComments = { ...likedComments };

    if (updatedLikedComments[index]) {
      updatedComments[index].likes = Math.max(0, (updatedComments[index].likes || 0) - 1);
      delete updatedLikedComments[index];
    } else {
      updatedComments[index].likes = (updatedComments[index].likes || 0) + 1;
      updatedLikedComments[index] = true;
    }

    setComments(updatedComments);
    setLikedComments(updatedLikedComments);
  };

  const handleReplyClick = (index) => {
    setReplyingTo(index);
    setReplyInput('');
  };

  const handleReplySubmit = (index) => {
    if (!replyInput.trim()) return;

    const updatedComments = [...comments];

    if (!updatedComments[index].replies) {
      updatedComments[index].replies = [];
    }

    updatedComments[index].replies.push({
      username,
      text: replyInput,
      time: new Date().toISOString(),
    });

    setComments(updatedComments);
    setReplyingTo(null);
    setReplyInput('');
  };
  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="comments-section">
      <h2>💬 Community Comments</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Add a comment..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Post</button>
      </form>

      <ul>
        {Array.isArray(comments) && comments.map((comment, index) => (
          <li key={index} className="comment-item">
            <div className="comment-box">
              <p><strong>{comment.username || 'Anonymous'}</strong>:</p>
              <p>{comment.text}</p>
              <div className="comment-actions">
                <button onClick={() => handleLike(index)}>
                  Like ({comment.likes || 0}) {likedComments[index] ? "(Liked)" : ""}
                </button>
                <button onClick={() => handleReplyClick(index)}>
                  Reply
                </button>
              </div>

              {replyingTo === index && (
                <div className="reply-input">
                  <textarea
                    placeholder="Write your reply..."
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                  />
                  <button onClick={() => handleReplySubmit(index)}>Post Reply</button>
                </div>
              )}

              {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                <div className="replies">
                  {comment.replies.map((reply, i) => (
                    <div key={i} className="reply-box">
                      <p><strong>{reply?.username || 'Anonymous'}</strong>:</p>
                      <p>{reply?.text || ''}</p>
                      <small>{reply?.time ? new Date(reply.time).toLocaleString() : ''}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <small>{comment.time ? new Date(comment.time).toLocaleString() : ''}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GlobalComments;
