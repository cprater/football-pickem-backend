import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../hooks';
import { Button, Input, Alert } from 'puppy-lib-components';
import './Auth.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const registerMutation = useRegister();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 50) {
      newErrors.username = 'Username must be less than 50 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await registerMutation.mutateAsync({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
      });
      // Navigate to dashboard after successful registration
      navigate('/dashboard');
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 409) {
        setErrors({ general: 'User with this email or username already exists' });
      } else if (error.response?.status === 400) {
        setErrors({ general: 'Please check your input and try again' });
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Register</h2>
        {errors.general && (
          <Alert variant="error" className="error-message">{errors.general}</Alert>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <Input
              type="text"
              id="username"
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              errorMessage={errors.username}
              required
            />
          </div>
          <div className="form-group">
            <Input
              type="email"
              id="email"
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              errorMessage={errors.email}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <Input
                type="text"
                id="firstName"
                name="firstName"
                label="First Name (Optional)"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <Input
                type="text"
                id="lastName"
                name="lastName"
                label="Last Name (Optional)"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <Input
              type="password"
              id="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              errorMessage={errors.password}
              required
            />
          </div>
          <div className="form-group">
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword}
              required
            />
          </div>
          <Button 
            type="submit" 
            variant="primary"
            disabled={registerMutation.isPending}
            loading={registerMutation.isPending}
            fullWidth
          >
            {registerMutation.isPending ? 'Creating Account...' : 'Register'}
          </Button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
