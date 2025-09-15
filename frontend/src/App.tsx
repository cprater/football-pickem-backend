import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './App.css';
import './styles/forms.css';
import './styles/dashboard.css';

// Import components (to be created)
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Leagues from './pages/Leagues';
import LeagueDetail from './pages/LeagueDetail';
import Dashboard from './pages/Dashboard';
import QueryErrorBoundary from './components/QueryErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

// Import QueryClient
import { queryClient } from './services/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorBoundary>
        <Router>
          <div className="App">
            <Header />
            <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/leagues" element={
                <ProtectedRoute>
                  <Leagues />
                </ProtectedRoute>
              } />
              <Route path="/leagues/:id" element={
                <ProtectedRoute>
                  <LeagueDetail />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
            </main>
          </div>
        </Router>
      </QueryErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;