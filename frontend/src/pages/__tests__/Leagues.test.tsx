import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Leagues from '../Leagues';

describe('Leagues Component', () => {
  it('should render the leagues heading', () => {
    render(<Leagues />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Leagues');
  });

  it('should render the leagues description', () => {
    render(<Leagues />);
    
    const description = screen.getByText('Browse and join football pickem leagues.');
    expect(description).toBeInTheDocument();
  });

  it('should have proper CSS classes', () => {
    render(<Leagues />);
    
    const leaguesContainer = screen.getByText('Leagues').closest('.leagues');
    expect(leaguesContainer).toBeInTheDocument();
    
    const container = screen.getByText('Leagues').closest('.container');
    expect(container).toBeInTheDocument();
  });

  it('should render the main container structure', () => {
    render(<Leagues />);
    
    const leagues = screen.getByText('Leagues').closest('.leagues');
    const container = screen.getByText('Leagues').closest('.container');
    
    expect(leagues).toContainElement(container);
    expect(container).toContainElement(screen.getByRole('heading', { level: 1 }));
    expect(container).toContainElement(screen.getByText('Browse and join football pickem leagues.'));
  });

  it('should be accessible', () => {
    render(<Leagues />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    
    const description = screen.getByText('Browse and join football pickem leagues.');
    expect(description).toBeInTheDocument();
  });

  it('should have proper semantic structure', () => {
    render(<Leagues />);
    
    const leagues = screen.getByText('Leagues').closest('.leagues');
    const container = screen.getByText('Leagues').closest('.container');
    
    expect(leagues).toBeInTheDocument();
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('container');
  });

  it('should render placeholder content', () => {
    render(<Leagues />);
    
    // Check that the component renders without errors
    expect(screen.getByText('Leagues')).toBeInTheDocument();
    expect(screen.getByText('Browse and join football pickem leagues.')).toBeInTheDocument();
  });

  it('should have consistent structure with other pages', () => {
    render(<Leagues />);
    
    const leagues = screen.getByText('Leagues').closest('.leagues');
    const container = screen.getByText('Leagues').closest('.container');
    
    // Should follow the same pattern as other pages
    expect(leagues).toHaveClass('leagues');
    expect(container).toHaveClass('container');
    expect(container).toContainElement(screen.getByRole('heading', { level: 1 }));
  });
});
