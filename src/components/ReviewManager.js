import React, { useState, useEffect } from 'react';
import ReactStars from 'react-rating-stars-component';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

export default function ReviewManager() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  // Function to render star ratings
  const renderStars = (rating) => {
    return (
      <ReactStars
        count={5}
        value={rating}
        size={24}
        edit={false}
        activeColor="#ffd700"
      />
    );
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/v1/getAllReviews');
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          // Set reviews with star ratings
          const reviewsWithStars = result.data.map(review => ({
            ...review,
            starRating: renderStars(review.rating)
          }));
          setReviews(reviewsWithStars);
        } else {
          throw new Error('Unexpected response format');
        }
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const response = await fetch('http://localhost:5000/api/v1/createReview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description, rating })
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      const newReview = await response.json();
      setReviews([...reviews, newReview]);
      setMessage('Review submitted successfully!');
      setName('');
      setDescription('');
      setRating(0);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", backgroundColor: '#f7f9fc', minHeight: '100vh', paddingTop: '20px' }}>
      <header style={{ backgroundColor: '#343a40', color: 'white', padding: '10px 20px', textAlign: 'center' }}>
        <h1>Customer Review Portal</h1>
      </header>
      
      <div className="container mt-5">
        <h2 className="text-center mb-4" style={{ color: '#007bff' }}>Submit a Review</h2>
        <form onSubmit={handleSubmit} className="p-4 shadow rounded" style={{ backgroundColor: '#ffffff' }}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ borderRadius: '10px' }}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              className="form-control"
              id="description"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ borderRadius: '10px' }}
            ></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="rating" className="form-label">Rating</label>
            <ReactStars
              count={5}
              onChange={(newRating) => setRating(newRating)}
              size={30}
              activeColor="#ffd700"
              value={rating}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" style={{ borderRadius: '10px', backgroundColor: '#007bff' }}>Submit</button>
        </form>
        {message && <p className="text-center mt-3" style={{ color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}
        
        <h2 className="text-center mt-5 mb-4" style={{ color: '#007bff' }}>Customer Reviews</h2>
        {loading ? (
          <p className="text-center">Loading reviews...</p>
        ) : error ? (
          <p className="text-center text-danger">Error: {error}</p>
        ) : (
          <div className="row">
            {reviews.length === 0 ? (
              <p className="text-center">No reviews available.</p>
            ) : (
              reviews.map(review => (
                <div key={review._id} className="col-md-6 mb-4">
                  <div className="card shadow-sm h-100">
                    <div className="card-body">
                      <h5 className="card-title">{review.name}</h5>
                      <p className="card-text">{review.description}</p>
                      <p className="card-text">
                        Rating: <span>{renderStars(review.rating)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      <footer style={{ backgroundColor: '#343a40', color: 'white', padding: '10px 20px', textAlign: 'center', marginTop: '20px' }}>
        <p>&copy; 2024 Review Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}
