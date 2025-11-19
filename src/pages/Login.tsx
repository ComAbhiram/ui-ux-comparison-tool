import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { email, password: password.length > 0 ? '***' : 'empty' });
      const result = await login(email, password);
      console.log('Login result:', result);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-text-light-secondary dark:text-text-dark-secondary">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 antialiased bg-background-light dark:bg-background-dark">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        {/* App Logo and Title */}
        <div className="flex flex-col items-center gap-2 text-center">
          <svg fill="none" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg">
            <rect className="fill-primary" height="48" rx="12" width="48"></rect>
            <path className="fill-white" d="M16 16H24V24H16V16Z"></path>
            <path className="fill-white fill-opacity-60" d="M24 24H32V32H24V24Z"></path>
          </svg>
          <h1 className="text-text-light-primary dark:text-text-dark-primary tracking-light text-[24px] font-bold">
            QA Bugtracking Tool
          </h1>
        </div>

        {/* Login Card */}
        <div className="w-full rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-8 shadow-soft-lg">
          <div className="flex flex-col gap-6">
            {/* Heading */}
            <div className="flex flex-col gap-1">
              <p className="text-text-light-primary dark:text-text-dark-primary text-2xl font-bold tracking-tight">
                Log in to your account
              </p>
              <p className="text-text-light-secondary dark:text-text-dark-secondary text-base font-normal">
                Select your role and enter your credentials.
              </p>
            </div>

            {/* Form */}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {/* Email Field */}
              <label className="flex flex-col">
                <p className="text-text-light-primary dark:text-text-dark-primary text-sm font-medium leading-normal pb-2">
                  Email
                </p>
                <input
                  className="form-input flex h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg bg-background-light dark:bg-background-dark p-3 text-base font-normal leading-normal text-text-light-primary dark:text-text-dark-primary placeholder:text-text-light-secondary dark:placeholder:text-text-dark-secondary focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-light dark:border-border-dark focus:border-primary dark:focus:border-primary transition"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </label>

              {/* Password Field */}
              <label className="flex flex-col">
                <p className="text-text-light-primary dark:text-text-dark-primary text-sm font-medium leading-normal pb-2">
                  Password
                </p>
                <input
                  className="form-input flex h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg bg-background-light dark:bg-background-dark p-3 text-base font-normal leading-normal text-text-light-primary dark:text-text-dark-primary placeholder:text-text-light-secondary dark:placeholder:text-text-dark-secondary focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-light dark:border-border-dark focus:border-primary dark:focus:border-primary transition"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </label>

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex min-w-[84px] h-12 cursor-pointer items-center justify-center overflow-hidden rounded-lg px-4 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="truncate">{isLoading ? 'Logging in...' : 'Log In'}</span>
              </button>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="w-full rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-4">
          <p className="text-sm font-medium text-text-light-primary dark:text-text-dark-primary mb-2">
            Default Admin Account:
          </p>
          <div className="text-xs text-text-light-secondary dark:text-text-dark-secondary space-y-1">
            <p>Email: admin@example.com</p>
            <p>Password: admin123</p>
            <p className="mt-2 italic text-xs">Note: Backend must be running with database migrated</p>
          </div>
        </div>
      </div>
    </div>
  );
}
