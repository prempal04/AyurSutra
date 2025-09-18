import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginForm({ role, onToggleRole }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill with test credentials based on role
  React.useEffect(() => {
    if (role === 'admin') {
      setEmail('admin@ayursutra.com');
      setPassword('admin123');
    } else if (role === 'patient') {
      setEmail('rahul@example.com');
      setPassword('patient123');
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('LoginForm: Attempting login with email:', email);

    try {
      const result = await login(email, password);
      console.log('LoginForm: Login result:', result);
      
      if (result.success) {
        // Navigate based on user role
        const userRole = result.user.role;
        console.log('LoginForm: Login successful, user role:', userRole);
        if (userRole === 'admin' || userRole === 'doctor') {
          navigate('/dashboard');
        } else if (userRole === 'patient') {
          navigate('/dashboard');
        }
      } else {
        console.log('LoginForm: Login failed:', result.message);
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('LoginForm: Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-emerald-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Sign in to AyurSutra
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {role === 'admin' ? 'Healthcare Provider Portal' : 'Patient Portal'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-600">
              Test Credentials: {role === 'admin' ? 'admin@ayursutra.com / admin123' : 'rahul@example.com / patient123'}
            </p>
          </div>
          <div className="flex space-x-2 mb-6">
            <button
              type="button"
              onClick={onToggleRole}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${role === 'admin' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Doctor/Admin
            </button>
            <button
              type="button"
              onClick={onToggleRole}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${role === 'patient' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Patient
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
