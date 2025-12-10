import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { searchAPI } from '../services/api';
import Header from '../components/Header';
import Button from '../components/Button';
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

  if (loading) {
    return (
      <>
        <Header showBack />
        <div className="page-wrapper">
          <div className="movie-card">
            <div className="card-inner">
              <div className="movie-content">
                <div className="movie-name skeleton skeleton-title"></div>

                <div className="movie-grid">
                  <div className="movie-column">
                    <div className="column-title skeleton skeleton-subtitle"></div>
                    <div className="column-divider skeleton skeleton-divider"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text"></div>
                  </div>

                  <div className="movie-column">
                    <div className="column-title skeleton skeleton-subtitle"></div>
                    <div className="column-divider skeleton skeleton-divider"></div>
                    <div className="skeleton skeleton-text"></div>
                  </div>
                </div>
              </div>

              <div className="back-btn-wrapper">
                <div className="skeleton skeleton-button"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !movie) {
    return (
      <>
        <Header showBack />
        <div className="page-wrapper">
          <div className="error-state">{error || 'Movie not found'}</div>
          <Button onClick={handleBackToSearch}>
            BACK TO SEARCH
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header showBack />
      <div className="page-wrapper">      
        <div className="movie-card">
          <div className="card-inner">
            <div className="movie-content">
              <h1 className="movie-name">{movie.title}</h1>

              <div className="movie-grid">
                <div className="movie-column">
                  <h2 className="column-title">Opening Crawl</h2>
                  <hr className="column-divider" />
                  <p className="opening-crawl">{movie.opening_crawl}</p>
                </div>

                {movie.characters && movie.characters.length > 0 && (
                  <div className="movie-column">
                    <h2 className="column-title">Characters</h2>
                    <hr className="column-divider" />
                    <p className="characters-inline">
                      {movie.characters.map((character, idx) => (
                        <span key={character.id ?? idx}>
                          <Link to={`/person/${character.id}`} className="film-link">
                            {character.name}
                          </Link>
                          {idx < movie.characters.length - 1 && ', '}
                        </span>
                      ))}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="back-btn-wrapper">
              <Button onClick={handleBackToSearch}>
                BACK TO SEARCH
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MovieDetails;
