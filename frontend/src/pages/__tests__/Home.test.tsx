import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Home from '../Home';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Home Component', () => {
  it('should render the main heading', () => {
    renderWithRouter(<Home />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Welcome to Football Pickem League');
  });

  it('should render the hero section with description', () => {
    renderWithRouter(<Home />);
    
    const description = screen.getByText('Join leagues, make picks, and compete with friends!');
    expect(description).toBeInTheDocument();
  });

  it('should render call-to-action buttons', () => {
    renderWithRouter(<Home />);
    
    const getStartedButton = screen.getByRole('link', { name: 'Get Started' });
    const browseLeaguesButton = screen.getByRole('link', { name: 'Browse Leagues' });
    
    expect(getStartedButton).toBeInTheDocument();
    expect(browseLeaguesButton).toBeInTheDocument();
  });

  it('should have correct href attributes for CTA buttons', () => {
    renderWithRouter(<Home />);
    
    const getStartedButton = screen.getByRole('link', { name: 'Get Started' });
    const browseLeaguesButton = screen.getByRole('link', { name: 'Browse Leagues' });
    
    expect(getStartedButton).toHaveAttribute('href', '/register');
    expect(browseLeaguesButton).toHaveAttribute('href', '/leagues');
  });

  it('should render features section', () => {
    renderWithRouter(<Home />);
    
    const joinLeaguesFeature = screen.getByText('Join Leagues');
    const makePicksFeature = screen.getByText('Make Picks');
    const trackStandingsFeature = screen.getByText('Track Standings');
    
    expect(joinLeaguesFeature).toBeInTheDocument();
    expect(makePicksFeature).toBeInTheDocument();
    expect(trackStandingsFeature).toBeInTheDocument();
  });

  it('should render feature descriptions', () => {
    renderWithRouter(<Home />);
    
    const joinLeaguesDesc = screen.getByText('Create or join public and private leagues with your friends.');
    const makePicksDesc = screen.getByText('Pick winners for NFL games and compete for the best record.');
    const trackStandingsDesc = screen.getByText('See how you stack up against other players in real-time.');
    
    expect(joinLeaguesDesc).toBeInTheDocument();
    expect(makePicksDesc).toBeInTheDocument();
    expect(trackStandingsDesc).toBeInTheDocument();
  });

  it('should have proper CSS classes', () => {
    renderWithRouter(<Home />);
    
    const homeContainer = screen.getByText('Welcome to Football Pickem League').closest('.home');
    expect(homeContainer).toBeInTheDocument();
    
    const heroSection = screen.getByText('Welcome to Football Pickem League').closest('.hero');
    expect(heroSection).toBeInTheDocument();
    
    const featuresSection = screen.getByText('Join Leagues').closest('.features');
    expect(featuresSection).toBeInTheDocument();
  });

  it('should render all feature items with proper structure', () => {
    renderWithRouter(<Home />);
    
    const featureItems = screen.getAllByRole('heading', { level: 3 });
    expect(featureItems).toHaveLength(3);
    
    const expectedFeatures = ['Join Leagues', 'Make Picks', 'Track Standings'];
    expectedFeatures.forEach(feature => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });
  });

  it('should have proper button classes', () => {
    renderWithRouter(<Home />);
    
    const getStartedButton = screen.getByRole('link', { name: 'Get Started' });
    const browseLeaguesButton = screen.getByRole('link', { name: 'Browse Leagues' });
    
    expect(getStartedButton).toHaveClass('btn', 'btn-primary');
    expect(browseLeaguesButton).toHaveClass('btn', 'btn-secondary');
  });

  it('should be accessible', () => {
    renderWithRouter(<Home />);
    
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();
    
    const featureHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(featureHeadings).toHaveLength(3);
    
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
  });
});
