import { useNavigate } from 'react-router-dom';
import { useAuth, useLogout } from '../hooks';
import { Header as PuppyHeader } from 'puppy-lib-components';
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

  const navItems = [
    { label: 'Leagues', href: '/leagues' },
    ...(isAuthenticated ? [{ label: 'Dashboard', href: '/dashboard' }] : [])
  ];

  return (
    <PuppyHeader
      title="Football Pickem"
      navItems={navItems}
      user={user ? {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl
      } : undefined}
      isAuthenticated={isAuthenticated}
      onLogin={() => navigate('/login')}
      onLogout={handleLogout}
    />
  );
};

export default Header;
