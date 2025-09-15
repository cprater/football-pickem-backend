import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useLogout } from '../hooks';
import './Header.css';

const Header: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          Football Pickem
        </Link>
        <nav className="nav">
          <Link to="/leagues" className="nav-link">Leagues</Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
          )}
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">Welcome, {user?.username}</span>
              <button 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="btn btn-secondary"
              >
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
