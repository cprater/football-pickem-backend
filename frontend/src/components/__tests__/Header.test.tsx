import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Header from '../Header';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  it('should render the header with logo', () => {
    renderWithRouter(<Header />);
    
    const logo = screen.getByText('Football Pickem');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('href', '/');
  });

  it('should render navigation links', () => {
    renderWithRouter(<Header />);
    
    const leaguesLink = screen.getByText('Leagues');
    const dashboardLink = screen.getByText('Dashboard');
    const loginLink = screen.getByText('Login');
    const registerLink = screen.getByText('Register');
    
    expect(leaguesLink).toBeInTheDocument();
    expect(dashboardLink).toBeInTheDocument();
    expect(loginLink).toBeInTheDocument();
    expect(registerLink).toBeInTheDocument();
  });

  it('should have correct href attributes for navigation links', () => {
    renderWithRouter(<Header />);
    
    const leaguesLink = screen.getByRole('link', { name: 'Leagues' });
    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
    const loginLink = screen.getByRole('link', { name: 'Login' });
    const registerLink = screen.getByRole('link', { name: 'Register' });
    
    expect(leaguesLink).toHaveAttribute('href', '/leagues');
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(loginLink).toHaveAttribute('href', '/login');
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('should have proper CSS classes', () => {
    renderWithRouter(<Header />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('header');
    
    const logo = screen.getByText('Football Pickem');
    expect(logo).toHaveClass('logo');
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('nav');
    
    const navLinks = screen.getAllByRole('link');
    navLinks.forEach(link => {
      if (link.textContent !== 'Football Pickem') {
        expect(link).toHaveClass('nav-link');
      }
    });
  });

  it('should render all navigation items', () => {
    renderWithRouter(<Header />);
    
    const navLinks = screen.getAllByRole('link');
    expect(navLinks).toHaveLength(5); // Logo + 4 nav links
    
    const expectedLinks = ['Football Pickem', 'Leagues', 'Dashboard', 'Login', 'Register'];
    expectedLinks.forEach(linkText => {
      expect(screen.getByText(linkText)).toBeInTheDocument();
    });
  });

  it('should be accessible', () => {
    renderWithRouter(<Header />);
    
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    
    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();
    
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});
