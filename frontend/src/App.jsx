import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SearchPage from './pages/SearchPage'
import ResultsPage from './pages/ResultsPage'
import PersonDetails from './pages/PersonDetails'
import MovieDetails from './pages/MovieDetails'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/person/:id" element={<PersonDetails />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
      </Routes>
    </Router>
  )
}

export default App
