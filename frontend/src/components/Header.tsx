import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          Football Pickem
        </Link>
        <nav className="nav">
          <Link to="/leagues" className="nav-link">Leagues</Link>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/register" className="nav-link">Register</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
