import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { searchAPI } from '../services/api';
import Header from '../components/Header';
import BackButton from '../components/BackButton';
import '../styles/DetailsPage.css';

function PersonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerson = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await searchAPI.getPerson(id);
        if (response.success) {
          console.log(response);
          setPerson(response.data.result.properties);
        } else {
          setError('Failed to fetch person details');
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPerson();
  }, [id]);

  const handleBackToSearch = () => {
    navigate('/');
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  if (loading) {
    return (
      <div className="details-page">
        <Header />
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="details-page">
        <Header />
        <div className="error-message">{error || 'Person not found'}</div>
        <button className="back-button-bottom" onClick={handleBackToSearch}>
          BACK TO SEARCH
        </button>
      </div>
    );
  }

  return (
    <div className="details-page">
      <Header />
      <BackButton />
      
      <div className="details-container">
        <h1 className="details-name">{person.name}</h1>
        
        <div className="details-section">
          <h2 className="section-title">Details</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Birth Year:</span>
              <span className="detail-value">{person.birth_year}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Gender:</span>
              <span className="detail-value">{person.gender}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Eye Color:</span>
              <span className="detail-value">{person.eye_color}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Hair Color:</span>
              <span className="detail-value">{person.hair_color}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Height:</span>
              <span className="detail-value">{person.height}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Mass:</span>
              <span className="detail-value">{person.mass}</span>
            </div>
          </div>
        </div>

        {person.films && person.films.length > 0 && (
          <div className="details-section">
            <h2 className="section-title">Movies</h2>
            <div className="movies-list">
              {person.films.map((film, idx) => (
                <button
                  key={film.id ?? idx}
                  className="movie-link"
                  onClick={() => handleMovieClick(film.id)}
                >
                  {film.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="back-button-bottom" onClick={handleBackToSearch}>
          BACK TO SEARCH
        </button>
      </div>
    </div>
  );
}

export default PersonDetails;
