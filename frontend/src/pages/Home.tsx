import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home">
      <div className="hero">
        <h1>Welcome to Football Pickem League</h1>
        <p>Join leagues, make picks, and compete with friends!</p>
        <div className="cta-buttons">
          <Link to="/register" className="btn btn-primary">Get Started</Link>
          <Link to="/leagues" className="btn btn-secondary">Browse Leagues</Link>
        </div>
      </div>
      
      <div className="features">
        <div className="feature">
          <h3>Join Leagues</h3>
          <p>Create or join public and private leagues with your friends.</p>
        </div>
        <div className="feature">
          <h3>Make Picks</h3>
          <p>Pick winners for NFL games and compete for the best record.</p>
        </div>
        <div className="feature">
          <h3>Track Standings</h3>
          <p>See how you stack up against other players in real-time.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
