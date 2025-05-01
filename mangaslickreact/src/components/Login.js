import React, { useState,useEffect } from 'react';
import './login.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // For API calls

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  
    useEffect(() => {
        
        document.title = "Login | My Website"; // Set custom tab name here
        return () => {
          document.title = "My Website"; // Reset to default when leaving this page
        };
      }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/auth/login`, { email, password });  
    
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        navigate('/');
      } else {
        setError(response.data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
    
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleLogin}>
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
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>
        Don't have an account? <a href="/signup">Sign Up</a>
      </p>
    </div>
  );
};

export default Login;
