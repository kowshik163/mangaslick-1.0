import React, { useState, useEffect } from 'react';
import './signup.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [username, setUsername] = useState(''); // added username
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Set the tab name (title) for this page
  useEffect(() => {
    
    document.title = "Sign Up | My Website"; // Set custom tab name here
    return () => {
      document.title = "My Website"; // Reset to default when leaving this page
    };
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/auth/signup`, {
        username,
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        alert('Account created successfully!');
        navigate('/login'); // Redirect to login page after successful signup
      } else {
        setError(response.data.message || 'Signup failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p>
        Already have an account? <a href="/login">Log In</a>
      </p>
    </div>
  );
};

export default Signup;
