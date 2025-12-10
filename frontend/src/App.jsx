import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PersonDetails from './pages/PersonDetails'
import MovieDetails from './pages/MovieDetails'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/person/:id" element={<PersonDetails />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
      </Routes>
    </Router>
  )
}

export default App
