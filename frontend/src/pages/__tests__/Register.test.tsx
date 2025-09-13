import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Register from '../Register';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  it('should render registration form', () => {
    renderWithRouter(<Register />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Register');
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Register' });
    
    expect(usernameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('should have proper form structure', () => {
    renderWithRouter(<Register />);
    
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    
    expect(usernameInput).toHaveAttribute('type', 'text');
    expect(usernameInput).toHaveAttribute('name', 'username');
    expect(usernameInput).toHaveAttribute('required');
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('name', 'email');
    expect(emailInput).toHaveAttribute('required');
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('name', 'password');
    expect(passwordInput).toHaveAttribute('required');
    
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('name', 'confirmPassword');
    expect(confirmPasswordInput).toHaveAttribute('required');
  });

  it('should update form data when user types', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    
    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    
    expect(usernameInput).toHaveValue('testuser');
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
    expect(confirmPasswordInput).toHaveValue('password123');
  });

  it('should handle form submission', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Register' });
    
    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Registration attempt:', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });
    
    consoleSpy.mockRestore();
  });

  it('should handle form submission correctly', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Register' });
    
    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);
    
    // Verify the form submission was handled
    expect(consoleSpy).toHaveBeenCalledWith('Registration attempt:', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });
    
    consoleSpy.mockRestore();
  });

  it('should render login link', () => {
    renderWithRouter(<Register />);
    
    const loginLink = screen.getByRole('link', { name: 'Login here' });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should have proper CSS classes', () => {
    renderWithRouter(<Register />);
    
    const authContainer = screen.getByRole('heading', { name: 'Register' }).closest('.auth-container');
    expect(authContainer).toBeInTheDocument();
    
    const authForm = screen.getByRole('heading', { name: 'Register' }).closest('.auth-form');
    expect(authForm).toBeInTheDocument();
    
    const submitButton = screen.getByRole('button', { name: 'Register' });
    expect(submitButton).toHaveClass('btn', 'btn-primary');
  });

  it('should handle input changes correctly', () => {
    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'newpassword' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword' } });
    
    expect(usernameInput).toHaveValue('newuser');
    expect(emailInput).toHaveValue('new@example.com');
    expect(passwordInput).toHaveValue('newpassword');
    expect(confirmPasswordInput).toHaveValue('newpassword');
  });

  it('should maintain form state correctly', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    
    // Fill out form partially
    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    
    expect(usernameInput).toHaveValue('testuser');
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('');
    expect(confirmPasswordInput).toHaveValue('');
    
    // Continue filling
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    
    expect(usernameInput).toHaveValue('testuser');
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
    expect(confirmPasswordInput).toHaveValue('password123');
  });

  it('should be accessible', () => {
    renderWithRouter(<Register />);
    
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
    
    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Register' });
    
    expect(usernameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('should have all required form fields', () => {
    renderWithRouter(<Register />);
    
    const requiredInputs = screen.getAllByRole('textbox').concat(screen.getAllByRole('textbox', { hidden: true }));
    const passwordInputs = screen.getAllByLabelText(/password/i);
    
    expect(requiredInputs.length).toBeGreaterThan(0);
    expect(passwordInputs).toHaveLength(2);
    
    // Check that all inputs have required attribute
    const allInputs = screen.getAllByRole('textbox').concat(screen.getAllByLabelText(/password/i));
    allInputs.forEach(input => {
      expect(input).toHaveAttribute('required');
    });
  });
});
