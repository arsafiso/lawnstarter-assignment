import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { searchAPI } from '../services/api';
import Header from '../components/Header';
import Button from '../components/Button';
import '../styles/DetailsPage.css';

const DetailRow = ({ label, value }) => {
  if (!value) return null;
  
  return (
    <li>{label}: {value}</li>
  );
};

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
          setPerson(response.data.result.properties);
          console.log({ response })
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

  if (loading) {
    return (
      <>
        <Header showBack />
        <div className="page-wrapper">
          <div className="person-card">
            <div className="card-inner">
              <div className="person-content">
                <div className="person-name skeleton skeleton-title"></div>

                <div className="person-grid">
                  <div className="person-column">
                    <div className="column-title skeleton skeleton-subtitle"></div>
                    <div className="column-divider skeleton skeleton-divider"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text"></div>
                  </div>

                  <div className="person-column">
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

  if (error || !person) {
    return (
      <>
        <Header showBack />
        <div className="page-wrapper">
          <div className="error-state">{error || 'Person not found'}</div>
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
        <div className="person-card">
          <div className="card-inner">
            <div className="person-content">
              <h1 className="person-name">{person.name}</h1>

              <div className="person-grid">
                <div className="person-column">
                  <h2 className="column-title">Details</h2>
                  <hr className="column-divider" />
                  <ul className="info-list">
                    <DetailRow label="Birth Year" value={person.birth_year} />
                    <DetailRow label="Gender" value={person.gender} />
                    <DetailRow label="Eye Color" value={person.eye_color} />
                    <DetailRow label="Hair Color" value={person.hair_color} />
                    <DetailRow label="Height" value={person.height} />
                    <DetailRow label="Mass" value={person.mass} />
                  </ul>
                </div>

                {person.films && person.films.length > 0 && (
                  <div className="person-column">
                    <h2 className="column-title">Movies</h2>
                    <hr className="column-divider" />

                    <p className="characters-inline">
                      {person.films.map((film, idx) => (
                        <span key={film.id ?? idx}>
                          <Link to={`/movie/${film.id}`} className="film-link">
                            {film.title}
                          </Link>
                          {idx < person.films.length - 1 && ', '}
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

export default PersonDetails;
