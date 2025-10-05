import { createContext, useContext, useReducer, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const cookieToken = Cookies.get('token');
      const lsToken = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
      const token = cookieToken || lsToken;
      console.log('Checking auth, token exists:', !!token);
      console.log('Token value:', token ? token.substring(0, 20) + '...' : 'none');
      
      if (token) {
        try {
          console.log('Attempting to get profile with token');
          const response = await authAPI.getProfile();
          console.log('Profile fetched successfully:', response.data.data.user.name, 'Role:', response.data.data.user.role);
          dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.data.user });
        } catch (error) {
          console.error('Auth check failed:', error.response?.status, error.response?.data?.message || error.message);
          console.log('Removing invalid token and logging out');
          Cookies.remove('token');
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('token');
          }
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        console.log('No token found, setting loading to false');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { user, token } = response.data.data;
      
      console.log('Login successful, storing token:', !!token);
      console.log('User role:', user.role);
      // Store token in cookie
      Cookies.set('token', token, { expires: 30 });
      // Also store in localStorage as a fallback for cross-site cookie issues
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('token', token);
      }
      
      // Verify token was stored
      const storedToken = Cookies.get('token') || (typeof window !== 'undefined' ? window.localStorage.getItem('token') : null);
      console.log('Token stored successfully:', !!storedToken);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      toast.success('Login successful!');
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      console.error('Login failed:', error.response?.status, message);
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data.data;
      
      // Store token in cookie
      Cookies.set('token', token, { expires: 30 });
      // And in localStorage fallback
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('token', token);
      }
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      toast.success('Registration successful!');
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('token');
      }
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      dispatch({ type: 'UPDATE_USER', payload: response.data.data.user });
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const changePassword = async (data) => {
    try {
      await authAPI.changePassword(data);
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const applyForCreator = async (data) => {
    try {
      const response = await authAPI.applyForCreator(data);
      dispatch({ type: 'UPDATE_USER', payload: { creatorApplication: response.data.data.creatorApplication } });
      toast.success('Creator application submitted successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Application failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    applyForCreator,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};