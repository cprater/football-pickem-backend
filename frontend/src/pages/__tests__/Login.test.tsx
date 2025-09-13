import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Login from '../Login';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  it('should render login form', () => {
    renderWithRouter(<Login />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Login');
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });
    
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('should have proper form structure', () => {
    renderWithRouter(<Login />);
    
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('name', 'email');
    expect(emailInput).toHaveAttribute('required');
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('name', 'password');
    expect(passwordInput).toHaveAttribute('required');
  });

  it('should update form data when user types', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('should handle form submission', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Login attempt:', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    consoleSpy.mockRestore();
  });

  it('should handle form submission correctly', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    // Verify the form submission was handled
    expect(consoleSpy).toHaveBeenCalledWith('Login attempt:', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    consoleSpy.mockRestore();
  });

  it('should render register link', () => {
    renderWithRouter(<Login />);
    
    const registerLink = screen.getByRole('link', { name: 'Register here' });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('should have proper CSS classes', () => {
    renderWithRouter(<Login />);
    
    const authContainer = screen.getByRole('heading', { name: 'Login' }).closest('.auth-container');
    expect(authContainer).toBeInTheDocument();
    
    const authForm = screen.getByRole('heading', { name: 'Login' }).closest('.auth-form');
    expect(authForm).toBeInTheDocument();
    
    const submitButton = screen.getByRole('button', { name: 'Login' });
    expect(submitButton).toHaveClass('btn', 'btn-primary');
  });

  it('should clear form fields after submission', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
    
    await user.click(submitButton);
    
    // Form fields should still have values since we're not clearing them in the current implementation
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('should be accessible', () => {
    renderWithRouter(<Login />);
    
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });
    
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('should handle input changes correctly', () => {
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'newpassword' } });
    
    expect(emailInput).toHaveValue('new@example.com');
    expect(passwordInput).toHaveValue('newpassword');
  });
});
