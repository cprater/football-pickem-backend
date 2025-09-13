import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Dashboard from '../Dashboard';

describe('Dashboard Component', () => {
  it('should render the dashboard heading', () => {
    render(<Dashboard />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Dashboard');
  });

  it('should render the dashboard description', () => {
    render(<Dashboard />);
    
    const description = screen.getByText('Your personal dashboard for managing picks and viewing standings.');
    expect(description).toBeInTheDocument();
  });

  it('should have proper CSS classes', () => {
    render(<Dashboard />);
    
    const dashboardContainer = screen.getByText('Dashboard').closest('.dashboard');
    expect(dashboardContainer).toBeInTheDocument();
    
    const container = screen.getByText('Dashboard').closest('.container');
    expect(container).toBeInTheDocument();
  });

  it('should render the main container structure', () => {
    render(<Dashboard />);
    
    const dashboard = screen.getByText('Dashboard').closest('.dashboard');
    const container = screen.getByText('Dashboard').closest('.container');
    
    expect(dashboard).toContainElement(container);
    expect(container).toContainElement(screen.getByRole('heading', { level: 1 }));
    expect(container).toContainElement(screen.getByText('Your personal dashboard for managing picks and viewing standings.'));
  });

  it('should be accessible', () => {
    render(<Dashboard />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    
    const description = screen.getByText('Your personal dashboard for managing picks and viewing standings.');
    expect(description).toBeInTheDocument();
  });

  it('should have proper semantic structure', () => {
    render(<Dashboard />);
    
    const dashboard = screen.getByText('Dashboard').closest('.dashboard');
    const container = screen.getByText('Dashboard').closest('.container');
    
    expect(dashboard).toBeInTheDocument();
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('container');
  });

  it('should render placeholder content', () => {
    render(<Dashboard />);
    
    // Check that the component renders without errors
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Your personal dashboard for managing picks and viewing standings.')).toBeInTheDocument();
  });
});
