import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { searchAPI } from '../services/api';
import Header from '../components/Header';
import BackButton from '../components/BackButton';
import '../styles/DetailsPage.css';

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await searchAPI.getFilm(id);
        if (response.success) {
          console.log(response);
          setMovie(response.data.result.properties);
        } else {
          setError('Failed to fetch movie details');
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  const handleBackToSearch = () => {
    navigate('/');
  };

  const handleCharacterClick = (characterId) => {
    navigate(`/person/${characterId}`);
  };

  if (loading) {
    return (
      <div className="details-page">
        <Header />
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="details-page">
        <Header />
        <div className="error-message">{error || 'Movie not found'}</div>
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
        <h1 className="details-name">{movie.title}</h1>
        
        <div className="details-section">
          <h2 className="section-title">Opening Crawl</h2>
          <p className="opening-crawl">{movie.opening_crawl}</p>
        </div>

        {movie.characters && movie.characters.length > 0 && (
          <div className="details-section">
            <h2 className="section-title">Characters</h2>
            <div className="characters-list">
              {movie.characters.map((character, idx) => (
                <button
                  key={character.id ?? idx}
                  className="character-link"
                  onClick={() => handleCharacterClick(character.id)}
                >
                  {character.name}
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

export default MovieDetails;
