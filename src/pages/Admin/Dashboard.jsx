import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Shield,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  GraduationCap,
  User,
  Eye,
  Ban,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/api';
import Loader from '../../components/Loader';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    pendingApplications: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [pendingCreators, setPendingCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch data in parallel to reduce TTFB
      const [statsRes, applicationsRes, coursesRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getCreatorApplications(),
        adminAPI.getPendingCourses()
      ]);

      const data = statsRes.data.data;
      setStats({
        totalUsers: data.statistics?.totalUsers || 0,
        totalCourses: data.statistics?.totalCourses || 0,
        totalRevenue: data.statistics?.totalRevenue || 0,
        pendingApplications: data.statistics?.pendingCreatorApplications || 0
      });

      setRecentActivity(data.recentActivity || []);
      setPendingApplications(applicationsRes.data.data || []);
      setPendingCreators(coursesRes.data.data || []);
      
      console.log('Dashboard data set:', {
        totalUsers: data.statistics?.totalUsers || 0,
        totalCourses: data.statistics?.totalCourses || 0,
        totalRevenue: data.statistics?.totalRevenue || 0,
        pendingApplications: data.statistics?.pendingCreatorApplications || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingData = async () => {
    try {
      // Fetch pending creator applications
      const applicationsResponse = await adminAPI.getCreatorApplications();
      setPendingApplications(applicationsResponse.data.data || []);
      
      // Fetch pending courses
      const coursesResponse = await adminAPI.getPendingCourses();
      setPendingCreators(coursesResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching pending data:', error);
    }
  };

  const handleApproveCreator = async (applicationId) => {
    try {
      await adminAPI.approveCreator(applicationId);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error approving creator:', error);
    }
  };

  const handleRejectCreator = async (applicationId) => {
    try {
      await adminAPI.rejectCreator(applicationId);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting creator:', error);
    }
  };

  const handleApproveCourse = async (courseId) => {
    try {
      await adminAPI.approveCourse(courseId, 'Course approved by admin');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error approving course:', error);
    }
  };

  const handleRejectCourse = async (courseId) => {
    try {
      await adminAPI.rejectCourse(courseId, 'Course rejected by admin');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting course:', error);
    }
  };

  const handleViewCourseDetails = (courseId) => {
    // Navigate to the dedicated course review page
    navigate(`/admin/courses/${courseId}/review`);
  };

  const showCourseDetailsModal = (course) => {
    // Create a modal to show course details
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    modal.innerHTML = `
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Course Details</h3>
            <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <h4 class="font-semibold text-gray-900">${course.title}</h4>
              <p class="text-sm text-gray-600 mt-1">by ${course.creator?.name || 'Unknown Creator'}</p>
            </div>
            
            <div>
              <h5 class="font-medium text-gray-900">Description</h5>
              <p class="text-sm text-gray-600 mt-1">${course.description || 'No description provided'}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <h5 class="font-medium text-gray-900">Category</h5>
                <p class="text-sm text-gray-600">${course.category || 'Not specified'}</p>
              </div>
              <div>
                <h5 class="font-medium text-gray-900">Level</h5>
                <p class="text-sm text-gray-600">${course.level || 'Not specified'}</p>
              </div>
              <div>
                <h5 class="font-medium text-gray-900">Price</h5>
                <p class="text-sm text-gray-600">$${course.price || 0}</p>
              </div>
              <div>
                <h5 class="font-medium text-gray-900">Status</h5>
                <p class="text-sm text-gray-600">${course.status || 'Unknown'}</p>
              </div>
            </div>
            
            ${course.tags && Array.isArray(course.tags) && course.tags.length > 0 ? `
            <div>
              <h5 class="font-medium text-gray-900">Tags</h5>
              <div class="flex flex-wrap gap-2 mt-1">
                ${course.tags.map(tag => `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${tag}</span>`).join('')}
              </div>
            </div>
            ` : ''}
            
            ${course.requirements && Array.isArray(course.requirements) && course.requirements.length > 0 ? `
            <div>
              <h5 class="font-medium text-gray-900">Requirements</h5>
              <ul class="text-sm text-gray-600 mt-1 list-disc list-inside">
                ${course.requirements.map(req => `<li>${req}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            ${course.outcomes && Array.isArray(course.outcomes) && course.outcomes.length > 0 ? `
            <div>
              <h5 class="font-medium text-gray-900">Learning Outcomes</h5>
              <ul class="text-sm text-gray-600 mt-1 list-disc list-inside">
                ${course.outcomes.map(outcome => `<li>${outcome}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            <div class="flex justify-end space-x-3 pt-4 border-t">
              <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                Close
              </button>
              <button onclick="handleApproveFromModal('${course._id}')" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Approve Course
              </button>
              <button onclick="handleRejectFromModal('${course._id}')" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Reject Course
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add global functions for modal actions
    window.handleApproveFromModal = async (courseId) => {
      try {
        await adminAPI.approveCourse(courseId, 'Course approved by admin');
        modal.remove();
        fetchDashboardData(); // Refresh data
        alert('Course approved successfully!');
      } catch (error) {
        console.error('Error approving course:', error);
        alert('Error approving course: ' + (error.response?.data?.message || error.message));
      }
    };
    
    window.handleRejectFromModal = async (courseId) => {
      try {
        await adminAPI.rejectCourse(courseId, 'Course rejected by admin');
        modal.remove();
        fetchDashboardData(); // Refresh data
        alert('Course rejected successfully!');
      } catch (error) {
        console.error('Error rejecting course:', error);
        alert('Error rejecting course: ' + (error.response?.data?.message || error.message));
      }
    };
  };

  const handleViewCreatorApplication = (application) => {
    // Create a modal to show creator application details
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    modal.innerHTML = `
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Creator Application Details</h3>
            <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <h4 class="font-semibold text-gray-900">${application.name}</h4>
              <p class="text-sm text-gray-600 mt-1">${application.email}</p>
            </div>
            
            <div>
              <h5 class="font-medium text-gray-900">Motivation</h5>
              <p class="text-sm text-gray-600 mt-1">${application.creatorApplication?.motivation || 'No motivation provided'}</p>
            </div>
            
            <div>
              <h5 class="font-medium text-gray-900">Experience</h5>
              <p class="text-sm text-gray-600 mt-1">${application.creatorApplication?.experience || 'No experience provided'}</p>
            </div>
            
            ${application.creatorApplication?.portfolio ? `
            <div>
              <h5 class="font-medium text-gray-900">Portfolio</h5>
              <a href="${application.creatorApplication.portfolio}" target="_blank" class="text-sm text-blue-600 hover:text-blue-800 mt-1">
                ${application.creatorApplication.portfolio}
              </a>
            </div>
            ` : ''}
            
            <div>
              <h5 class="font-medium text-gray-900">Application Date</h5>
              <p class="text-sm text-gray-600 mt-1">${new Date(application.creatorApplication?.appliedAt).toLocaleString()}</p>
            </div>
            
            <div>
              <h5 class="font-medium text-gray-900">Status</h5>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                ${application.creatorApplication?.status || 'Pending'}
              </span>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4 border-t">
              <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                Close
              </button>
              <button onclick="handleApproveCreatorFromModal('${application._id}')" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Approve Application
              </button>
              <button onclick="handleRejectCreatorFromModal('${application._id}')" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Reject Application
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add global functions for modal actions
    window.handleApproveCreatorFromModal = async (applicationId) => {
      try {
        await adminAPI.approveCreator(applicationId);
        modal.remove();
        fetchDashboardData(); // Refresh data
        alert('Creator application approved successfully!');
      } catch (error) {
        console.error('Error approving creator:', error);
        alert('Error approving creator: ' + (error.response?.data?.message || error.message));
      }
    };
    
    window.handleRejectCreatorFromModal = async (applicationId) => {
      try {
        await adminAPI.rejectCreator(applicationId, 'Application rejected by admin');
        modal.remove();
        fetchDashboardData(); // Refresh data
        alert('Creator application rejected successfully!');
      } catch (error) {
        console.error('Error rejecting creator:', error);
        alert('Error rejecting creator: ' + (error.response?.data?.message || error.message));
      }
    };
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader label="Loading admin dashboard..." size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {user?.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Shield className="h-4 w-4" />
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Users
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Courses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalCourses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Revenue
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${stats.totalRevenue.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              if (pendingApplications.length > 0) {
                document.getElementById('pending-applications-section')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Applications
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.pendingApplications}
                    </dd>
                  </dl>
                </div>
                {pendingApplications.length > 0 && (
                  <div className="flex-shrink-0">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pending Applications Section */}
        {pendingApplications.length > 0 && (
          <div id="pending-applications-section" className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Pending Creator Applications
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {pendingApplications.length} pending
                </span>
              </div>
              <div className="space-y-4">
                {pendingApplications.map((application) => (
                  <div key={application._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{application.name}</h4>
                        <p className="text-sm text-gray-500">{application.email}</p>
                        <p className="text-sm text-gray-600 mt-1">{application.creatorApplication?.motivation}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Applied: {new Date(application.creatorApplication?.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewCreatorApplication(application)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleApproveCreator(application._id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectCreator(application._id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pending Courses Section */}
        {pendingCreators.length > 0 && (
          <div id="pending-courses-section" className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Pending Course Reviews
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {pendingCreators.length} pending
                </span>
              </div>
              <div className="space-y-4">
                {pendingCreators.map((course) => (
                  <div key={course._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{course.title}</h4>
                        <p className="text-sm text-gray-500">by {course.creator?.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">Category: {course.category}</span>
                          <span className="text-xs text-gray-500">Level: {course.level}</span>
                          <span className="text-xs text-gray-500">Price: ${course.price}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewCourseDetails(course._id)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleApproveCourse(course._id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectCourse(course._id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <li key={index}>
                      <div className="relative pb-8">
                        {index !== recentActivity.length - 1 && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              {activity.type === 'user_registration' && <Users className="h-4 w-4 text-white" />}
                              {activity.type === 'course_created' && <BookOpen className="h-4 w-4 text-white" />}
                              {activity.type === 'creator_application' && <UserCheck className="h-4 w-4 text-white" />}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                {activity.description}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time dateTime={activity.createdAt}>
                                {new Date(activity.createdAt).toLocaleDateString()}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-center py-8 text-gray-500">
                    No recent activity
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/admin/users" className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">All Users</h3>
                <p className="text-sm text-gray-500">View and manage all users</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/learners" className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Learners</h3>
                <p className="text-sm text-gray-500">Manage learners and their progress</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/creators" className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Creators</h3>
                <p className="text-sm text-gray-500">Manage creators and their courses</p>
              </div>
            </div>
          </Link>

          <div 
            className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              if (pendingCreators.length > 0) {
                document.getElementById('pending-courses-section')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Courses</h3>
                <p className="text-sm text-gray-500">Review and moderate courses</p>
              </div>
              {pendingCreators.length > 0 && (
                <div className="ml-auto">
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;