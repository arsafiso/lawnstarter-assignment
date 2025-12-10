import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/SearchPage.css';

function SearchPage() {
  const [searchType, setSearchType] = useState('people');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/results', { 
        state: { 
          query: searchQuery.trim(), 
          type: searchType 
        } 
      });
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const isSearchEnabled = searchQuery.trim().length > 0;

  return (
    <div className="search-page">
      <Header />
      
      <div className="search-container">
        <h1 className="search-title">What are you searching for ?</h1>
        
        <div className="search-options">
          <label className="radio-option">
            <input
              type="radio"
              name="searchType"
              value="people"
              checked={searchType === 'people'}
              onChange={(e) => setSearchType(e.target.value)}
            />
            <span className="radio-label">People</span>
          </label>
          
          <label className="radio-option">
            <input
              type="radio"
              name="searchType"
              value="films"
              checked={searchType === 'films'}
              onChange={(e) => setSearchType(e.target.value)}
            />
            <span className="radio-label">Movies</span>
          </label>
        </div>

        <form onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="e.g. Chewbacca, Yoda"
            value={searchQuery}
            onChange={handleInputChange}
          />
          
          <button
            type="submit"
            className={`search-button ${isSearchEnabled ? 'enabled' : 'disabled'}`}
            disabled={!isSearchEnabled}
          >
            SEARCH
          </button>
        </form>
      </div>
    </div>
  );
}

export default SearchPage;
