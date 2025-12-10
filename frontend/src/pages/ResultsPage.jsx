import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchAPI } from '../services/api';
import Header from '../components/Header';
import BackButton from '../components/BackButton';
import '../styles/ResultsPage.css';

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { query, type } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query || !type) {
      navigate('/');
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await searchAPI.search(query, type);
        if (response.success) {
          console.log(response);
          setResults(response.data.result || []);
        } else {
          setError('Failed to fetch results');
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, type, navigate]);

  const handleResultClick = (id) => {
    if (type === 'people') {
      navigate(`/person/${id}`);
    } else {
      navigate(`/movie/${id}`);
    }
  };

  const handleBackToSearch = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="results-page">
        <Header />
        <div className="results-container">
          <h1 className="results-title">Results</h1>
          <div className="loading">Searching...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-page">
      <Header />
      <BackButton />
      
      <div className="results-container">
        <h1 className="results-title">Results</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        {!error && results.length === 0 && (
          <div className="no-results">
            <p>There are zero matches.</p>
            <p>Use the form to search for People or Movies.</p>
          </div>
        )}
        
        {!error && results.length > 0 && (
          <div className="results-list">
            {results.map((result) => (
              <div key={result.id} className="result-item">
                <h2 className="result-name">
                  {type === 'people' ? result.properties.name : result.properties.title}
                </h2>
                <button
                  className="details-button"
                  onClick={() => handleResultClick(result.uid)}
                >
                  SEE DETAILS
                </button>
              </div>
            ))}
          </div>
        )}
        
        <button className="back-button-bottom" onClick={handleBackToSearch}>
          BACK TO SEARCH
        </button>
      </div>
    </div>
  );
}

export default ResultsPage;
