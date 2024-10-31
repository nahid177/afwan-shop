// src/app/reviews/page.tsx

'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import axios from 'axios';

const ReviewsPage = () => {
  const [user, setUser] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!user || !reviewText || !imageFile) {
      setErrorMessage('Please fill in all fields and select an image.');
      return;
    }

    setLoading(true);
    try {
      // Upload the image first
      const formData = new FormData();
      formData.append('files', imageFile);

      const uploadResponse = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const imageUrl = uploadResponse.data.urls[0];

      // Submit the review
   // Remove 'reviewResponse' variable since it's not used
await axios.post('/api/reviews', {
    user,
    reviewText,
    imageUrl,
  });
  
      setSuccessMessage('Review submitted successfully!');
      setUser('');
      setReviewText('');
      setImageFile(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrorMessage('Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Submit Your Review
      </Typography>

      <TextField
        label="Your Name"
        fullWidth
        margin="normal"
        value={user}
        onChange={(e) => setUser(e.target.value)}
      />
      <TextField
        label="Your Review"
        fullWidth
        multiline
        minRows={4}
        margin="normal"
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
      />
      <Button variant="contained" component="label" sx={{ mt: 2 }}>
        Upload Image
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setImageFile(e.target.files[0]);
            }
          }}
        />
      </Button>
      {imageFile && <Typography sx={{ mt: 1 }}>{imageFile.name}</Typography>}

      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Review'}
        </Button>
      </Box>

      {successMessage && (
        <Snackbar
          open
          autoHideDuration={6000}
          onClose={() => setSuccessMessage(null)}
        >
          <Alert
            onClose={() => setSuccessMessage(null)}
            severity="success"
            sx={{ width: '100%' }}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      )}

      {errorMessage && (
        <Snackbar
          open
          autoHideDuration={6000}
          onClose={() => setErrorMessage(null)}
        >
          <Alert
            onClose={() => setErrorMessage(null)}
            severity="error"
            sx={{ width: '100%' }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default ReviewsPage;
