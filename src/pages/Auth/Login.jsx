import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Eye, EyeOff, User, GraduationCap, Shield, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'learner', // Default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData);
    
    if (result.success) {
      // Navigate based on user role
      const userRole = result.user?.role || formData.role;
      
      if (from !== '/') {
        // If user was trying to access a specific page, go there
        navigate(from, { replace: true });
      } else {
        // Otherwise, redirect based on role
        switch (userRole) {
          case 'creator':
            navigate('/creator/dashboard', { replace: true });
            break;
          case 'admin':
            navigate('/admin/dashboard', { replace: true });
            break;
          case 'learner':
          default:
            navigate('/learner/dashboard', { replace: true });
            break;
        }
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-30"></div>
              <div className="relative bg-white p-4 rounded-full shadow-lg">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to continue your learning journey
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Demo Admin Credentials Notice */}
          <div className="mb-4 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
            <strong>Demo Admin:</strong> Email: <code>admin@mail.com</code> · Password: <code>admin123</code>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Sign in as
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'learner' })}
                  className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 ${
                    formData.role === 'learner'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <GraduationCap className="h-6 w-6 mb-2" />
                  <span className="font-medium text-sm">Learner</span>
                  <span className="text-xs opacity-75">Take courses</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'creator' })}
                  className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 ${
                    formData.role === 'creator'
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-md'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <User className="h-6 w-6 mb-2" />
                  <span className="font-medium text-sm">Creator</span>
                  <span className="text-xs opacity-75">Create courses</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 ${
                    formData.role === 'admin'
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-md'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <Shield className="h-6 w-6 mb-2" />
                  <span className="font-medium text-sm">Admin</span>
                  <span className="text-xs opacity-75">Manage platform</span>
                </button>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              )}
            </button>

            {/* Additional Links */}
            <div className="text-center space-y-3">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Forgot your password?
              </Link>
              <div className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  Create one now
                </Link>
              </div>
              <div className="pt-2">
                <Link
                  to="/admin/login"
                  className="text-sm text-red-600 hover:text-red-700 flex items-center justify-center font-medium transition-colors duration-200"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Admin Login
                </Link>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;