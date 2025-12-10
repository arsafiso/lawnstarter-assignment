import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchAPI } from '../services/api';
import '../styles/HomePage.css';
import Header from '../components/Header';
import Button from '../components/Button';

function HomePage() {
  const [searchType, setSearchType] = useState('people');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [showMobileResults, setShowMobileResults] = useState(false);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const performSearch = useCallback(async (query, type) => {
    setLoading(true);
    setError(null);
    setShowMobileResults(true);

    try {
      const response = await searchAPI.search(query.trim(), type);

      if (response.success) {
        setResults(response.data.result || []);
      } else {
        setError('Failed to fetch results');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const queryParam = searchParams.get('q');
    const typeParam = searchParams.get('type');

    if (queryParam && typeParam) {
      setSearchQuery(queryParam);
      setSearchType(typeParam);
      performSearch(queryParam, typeParam);
    }
  }, [searchParams, performSearch]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setSearchParams({ q, type: searchType });
    await performSearch(q, searchType);
  };

  const handleResultClick = useCallback(
    (id) => {
      const routes = {
        people: `/person/${id}`,
        films: `/movie/${id}`,
      };
      navigate(routes[searchType]);
    },
    [navigate, searchType]
  );

  const handleBackToSearch = () => {
    setShowMobileResults(false);
    setSearchParams({});
  };

  const isSearchEnabled = useMemo(() => searchQuery.trim().length > 0, [searchQuery]);

  return (
    <>
      <Header showBack={!loading && showMobileResults} onBack={handleBackToSearch} />

      <div className="home-container">
        <div className={`search-section ${showMobileResults ? 'hide-mobile' : ''}`}>
          <div className="search-title">What are you searching for ?</div>

          <div className="search-options">
            {['people', 'films'].map((type) => (
              <label key={type} className="radio-option">
                <input
                  type="radio"
                  name="searchType"
                  value={type}
                  checked={searchType === type}
                  onChange={() => setSearchType(type)}
                />
                <span className="radio-label">{type === 'people' ? 'People' : 'Movies'}</span>
              </label>
            ))}
          </div>

          <form onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="e.g. Chewbacca, Yoda"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Button variant="button-primary" type="submit" disabled={!isSearchEnabled}>
              {loading ? 'SEARCHING...' : 'SEARCH'}
            </Button>
          </form>
        </div>

        <div className={`results-section ${showMobileResults ? 'show-mobile' : 'hide-mobile-results'}`}>
          <div className="results-title">Results</div>
          <hr className="results-divider" />

          {loading && <div className="loading">Searching...</div>}
          {error && <div className="error-message">{error}</div>}

          {!loading && !error && results.length === 0 && (
            <div className="no-results">
              <p>
                There are zero matches. <br />
                Use the form to search for People or Movies.
              </p>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="results-list">
              {results.map((result) => (
                <div key={result.uid} className="result-item">
                  <h3 className="result-name">
                    {result.properties.name || result.properties.title}
                  </h3>

                  <Button variant="detail" onClick={() => handleResultClick(result.uid)}>
                    SEE DETAILS
                  </Button>
                </div>
              ))}
            </div>
          )}

          {!loading && (
            <Button variant="sticky-back" className="mobile-only" onClick={handleBackToSearch}>
              BACK TO SEARCH
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

export default HomePage;
