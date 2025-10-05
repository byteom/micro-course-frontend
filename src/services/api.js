import axios from 'axios';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../config/api';

// Security: Validate API URL in production
if (import.meta.env.PROD && !API_BASE_URL.includes('https://')) {
  console.error('❌ Security Warning: API URL must use HTTPS in production!');
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const cookieToken = Cookies.get('token');
    const lsToken = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
    const token = cookieToken || lsToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    const url = error.config?.url || '';
    const status = error.response?.status;
    console.error('API Error:', url, status, error.message);
    const shouldForceLogout = status === 401 && (/^\/auth\//.test(url) || url === '/auth/profile');
    if (shouldForceLogout) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  applyForCreator: (data) => api.post('/auth/apply-creator', data),
};

// Course API
export const courseAPI = {
  getCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  searchCourses: (params) => api.get('/courses/search', { params }),
  getCoursesByCategory: (category, params) => api.get(`/courses/category/${category}`, { params }),
  enrollInCourse: (id) => api.post(`/courses/${id}/enroll`),
  getEnrolledCourses: () => api.get('/courses/enrolled/my-courses'),
  rateCourse: (id, rating) => api.post(`/courses/${id}/rate`, { rating }),
};

// Lesson API
export const lessonAPI = {
  getLesson: (id) => api.get(`/lessons/${id}`),
  markLessonComplete: (id) => api.post(`/lessons/${id}/complete`),
  getLessonProgress: (id) => api.get(`/lessons/${id}/progress`),
};

// Creator API
export const creatorAPI = {
  createCourse: (data) => api.post('/creator/courses', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyCourses: (params) => api.get('/creator/courses', { params }),
  updateCourse: (id, data) => api.put(`/creator/courses/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteCourse: (id) => api.delete(`/creator/courses/${id}`),
  submitCourse: (id) => api.post(`/creator/courses/${id}/submit`),
  createLesson: (courseId, data) => api.post(`/creator/courses/${courseId}/lessons`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getCourseLessons: (courseId) => api.get(`/creator/courses/${courseId}/lessons`),
  getLesson: (id) => api.get(`/creator/lessons/${id}`),
  updateLesson: (id, data) => api.put(`/creator/lessons/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteLesson: (id) => api.delete(`/creator/lessons/${id}`),
  generateTranscription: (id) => api.post(`/creator/lessons/${id}/transcribe`),
  getCourseAnalytics: (id) => api.get(`/creator/courses/${id}/analytics`),
  uploadVideo: (data) => api.post('/creator/upload/video', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Learner API
export const learnerAPI = {
  enrollInCourse: (courseId) => api.post(`/learner/courses/${courseId}/enroll`),
  completeLesson: (courseId, lessonId) => api.post(`/learner/courses/${courseId}/lessons/${lessonId}/complete`),
  getEnrolledCourses: () => api.get('/learner/courses'),
  getCourseLessons: (courseId) => api.get(`/learner/courses/${courseId}/lessons`),
  getCourseProgress: (id) => api.get(`/learner/courses/${id}/progress`),
  getCertificate: (id) => api.get(`/learner/courses/${id}/certificate`, { responseType: 'blob' }),
  getCertificatePreview: (id) => api.get(`/learner/courses/${id}/certificate/preview`),
  getRecommendations: () => api.get('/learner/recommendations'),
  getLearningStats: () => api.get('/learner/stats'),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}/details`),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  blockUser: (userId, reason) => api.put(`/admin/users/${userId}/block`, { reason }),
  unblockUser: (userId) => api.put(`/admin/users/${userId}/unblock`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  restrictUserCourses: (userId, courseIds, reason) => api.put(`/admin/users/${userId}/restrict-courses`, { courseIds, reason }),
  unrestrictUserCourses: (userId, courseIds) => api.put(`/admin/users/${userId}/unrestrict-courses`, { courseIds }),
  getAllLearners: (params) => api.get('/admin/learners', { params }),
  getAllCreators: (params) => api.get('/admin/creators', { params }),
  getAllCourses: (params) => api.get('/admin/courses', { params }),
  getPendingCourses: () => api.get('/admin/courses/pending'),
  approveCourse: (courseId, feedback) => api.put(`/admin/courses/${courseId}/approve`, { feedback }),
  rejectCourse: (courseId, reason) => api.put(`/admin/courses/${courseId}/reject`, { reason }),
  reviewCourse: (id, data) => api.put(`/admin/courses/${id}/review`, data),
  getCourseEnrollments: (id) => api.get(`/admin/courses/${id}/enrollments`),
  getCourseDetails: (id) => api.get(`/admin/courses/${id}`),
  getCreatorApplications: (params) => api.get('/admin/creator-applications', { params }),
  reviewCreatorApplication: (id, data) => api.put(`/admin/creator-applications/${id}/review`, data),
  approveCreator: (creatorId) => api.put(`/admin/creators/${creatorId}/approve`),
  rejectCreator: (creatorId, reason) => api.put(`/admin/creators/${creatorId}/reject`, { reason }),
  getSystemLogs: () => api.get('/admin/logs'),
};

export default api;