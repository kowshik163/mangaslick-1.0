import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCircle } from 'react-icons/fa';
import './profile.css';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    bookmarks: [],
    createdAt: '',
    profilePhoto: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [editState, setEditState] = useState({
    username: false,
    bio: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem('token');
      console.log('Using token:', token);
      console.log('Calling:', `${process.env.REACT_APP_BACKEND_URL}/api/user`);
  
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }
  
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
  
        if (response.data?.success) {
          const userData = response.data.data;
  
          setProfileData({
            username: userData.username || '',
            bio: userData.bio || '',
            bookmarks: Array.isArray(userData.bookmarks) ? userData.bookmarks : [],
            createdAt: userData.created_at || userData.createdAt || '',
            profilePhoto: userData.profile_photo || userData.profilePhoto || ''
          });
          setError(null);
        } else {
          setError(response.data.message || 'Failed to load profile data');
        }
      } catch (err) {
        console.error('Axios error:', err);
        if (err.response?.status === 401) {
    setError('Please login.');
    localStorage.removeItem('token'); // optional: clear the expired token
    // Optionally: redirect to login page
  } else {
    setError(err.response?.data?.message || 'Failed to load profile data. Please try again later.');
  }
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfileData();
  }, []);
  

  // Handle username update
  const handleUsernameChange = async () => {
    if (!profileData.username.trim()) {
      setError('Username cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/username`, 
        { username: profileData.username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage('Username updated successfully');
        setEditState(prev => ({ ...prev, username: false }));
        setError(null);
      } else {
        setError(response.data.message || 'Failed to update username');
      }
    } catch (err) {
      console.error('Error updating username:', err);
      setError(err.response?.data?.message || 'Failed to update username');
    }
  };

  // Handle bio update
  const handleBioUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/bio`, 
        { bio: profileData.bio },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage('Bio updated successfully');
        setEditState(prev => ({ ...prev, bio: false }));
        setError(null);
      } else {
        setError(response.data.message || 'Failed to update bio');
      }
    } catch (err) {
      console.error('Error updating bio:', err);
      setError(err.response?.data?.message || 'Failed to update bio');
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setError('Both current and new password are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/password`, 
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage('Password updated successfully');
        setPasswordData({ currentPassword: '', newPassword: '' });
        setError(null);
      } else {
        setError(response.data.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err.response?.data?.message || 'Failed to update password');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  if (error) {
    return (
      <div className="profile-page">
        <div className="error-message">
          {error}
          {/* <button onClick={() => setError(null)}>Dismiss</button>
          <button onClick={useEffect}>Retry</button> */}
        </div>
        {/* Show available profile data even with errors */}
      </div>
    );
  }

  return (
    <div className="profile-page">
      {successMessage && (
        <div className="success-message" onAnimationEnd={() => setSuccessMessage(null)}>
          {successMessage}
        </div>
      )}
      
      <div className="profile-header">
        <div className="profile-photo">
          {profileData.profilePhoto ? (
            <img src={profileData.profilePhoto} alt="Profile" className="profile-image" />
          ) : (
            <FaUserCircle size={100} color="#ccc" />
          )}
        </div>
        <div className="profile-info">
          <h1>{profileData.username}'s Profile</h1>
          <p>Account created on: {new Date(profileData.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="profile-details">
        {/* Editable Username Section */}
        <div className="section">
          <h3>Change Username</h3>
          {editState.username ? (
            <div>
              <input
                type="text"
                name="username"
                value={profileData.username}
                onChange={handleInputChange}
                className="username-input"
                placeholder="New username"
              />
              <button onClick={handleUsernameChange} className="update-username-btn">
                Update Username
              </button>
              <button 
                onClick={() => setEditState(prev => ({ ...prev, username: false }))}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <span>{profileData.username}</span>
              <button 
                onClick={() => setEditState(prev => ({ ...prev, username: true }))}
                className="edit-username-btn"
              >
                Edit Username
              </button>
            </div>
          )}
        </div>

        {/* Editable Bio Section */}
        <div className="section">
          <h3>Change Bio</h3>
          {editState.bio ? (
            <div>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                placeholder="Tell us something about yourself"
                rows="4"
                className="bio-input"
              ></textarea>
              <button onClick={handleBioUpdate} className="update-bio-btn">
                Update Bio
              </button>
              <button 
                onClick={() => setEditState(prev => ({ ...prev, bio: false }))}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <span>{profileData.bio || 'No bio yet'}</span>
              <button 
                onClick={() => setEditState(prev => ({ ...prev, bio: true }))}
                className="edit-bio-btn"
              >
                Edit Bio
              </button>
            </div>
          )}
        </div>

        {/* Change Password Section */}
        <div className="section">
          <h3>Change Password</h3>
          <input
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordInputChange}
            className="password-input"
            placeholder="Current password"
          />
          <input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordInputChange}
            className="password-input"
            placeholder="New password"
          />
          <button onClick={handlePasswordChange} className="update-password-btn">
            Update Password
          </button>
        </div>
 
        {/* Bookmarks Section */}
        <div className="section">
          <h3>Your Bookmarked Manga</h3>
          {profileData.bookmarks.length > 0 ? (
            <div className="bookmarks-list">
              {profileData.bookmarks.map((bookmark) => (
                <div key={bookmark.id} className="bookmark-item">
                  <img
                    src={bookmark.coverImage}
                    alt={bookmark.title}
                    style={{ width: '100px' }}referrerPolicy='no-referrer'
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-cover.jpg';
                      
                    }}
                  />
                  <div>{bookmark.title}</div>
                </div>
              ))}
            </div>
          ) : (
            <p>No bookmarks yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;