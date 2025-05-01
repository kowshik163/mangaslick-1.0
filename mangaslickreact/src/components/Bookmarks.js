import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Grid, Card, CardMedia, CardContent, 
  Typography, CircularProgress, Box, Button, 
  Snackbar, Alert 
} from '@mui/material';
import { RemoveCircle } from '@mui/icons-material';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'error' 
  });
  const navigate = useNavigate();

  const fetchBookmarks = useCallback(async (cancelToken) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/bookmarks`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cancelToken,
          withCredentials: true
        }
      );
      
      setBookmarks(response.data || []);
    } catch (error) {
      if (axios.isCancel(error)) {
        return;
      }
      
      console.error('Error fetching bookmarks:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(error.response?.data?.message || 'Failed to load bookmarks. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleRemoveBookmark = async (mangaId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/bookmarks/${mangaId}`, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== mangaId));
      setSnackbar({ 
        open: true, 
        message: 'Bookmark removed successfully', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to remove bookmark', 
        severity: 'error' 
      });
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    const source = axios.CancelToken.source();
    fetchBookmarks(source.token);

    return () => {
      source.cancel('Component unmounted');
    };
  }, [fetchBookmarks]);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Typography color="error" variant="h6" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => fetchBookmarks()}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Your Bookmarked Mangas
      </Typography>
      
      {bookmarks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="textSecondary">
            You haven't bookmarked any mangas yet.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/manga')}
          >
            Browse Mangas
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {bookmarks.map((bookmark) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={bookmark.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  image={bookmark.coverImage || '/default-manga-cover.jpg'}
                  alt={bookmark.title}
                  sx={{ height: 300, objectFit: 'cover' }}
                  onClick={() => navigate(`/manga/${bookmark.id}`)}
                  style={{ cursor: 'pointer' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2">
                    {bookmark.title}
                  </Typography>
                  <Button
                    startIcon={<RemoveCircle />}
                    color="error"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBookmark(bookmark.id);
                    }}
                    sx={{ mt: 1 }}
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Bookmarks;