import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  User,
  Mail,
  Calendar,
  BookOpen,
  Award,
  Ban,
  CheckCircle,
  Trash2,
  AlertCircle,
  Shield,
  GraduationCap,
  Clock,
  Eye,
  XCircle
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [createdCourses, setCreatedCourses] = useState([]);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUserDetails(id);
      const data = response.data.data;
      
      setUser(data.user);
      setStatistics(data.statistics);
      setCreatedCourses(data.createdCourses || []);
      setRecentActivity(data.recentActivity);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to fetch user details');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async () => {
    const reason = prompt('Enter reason for blocking:');
    if (!reason) return;

    setActionLoading(true);
    try {
      await adminAPI.blockUser(id, reason);
      toast.success('User blocked successfully');
      fetchUserDetails();
    } catch (error) {
      toast.error('Failed to block user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockUser = async () => {
    setActionLoading(true);
    try {
      await adminAPI.unblockUser(id);
      toast.success('User unblocked successfully');
      fetchUserDetails();
    } catch (error) {
      toast.error('Failed to unblock user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted successfully');
      navigate('/admin/users');
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (user.accountStatus === 'deleted') {
      return <span className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full">Deleted</span>;
    }
    if (user.isBlocked) {
      return <span className="px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded-full">Blocked</span>;
    }
    return <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">Active</span>;
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case 'learner':
        return <GraduationCap className="h-5 w-5 text-blue-600" />;
      case 'creator':
        return <User className="h-5 w-5 text-green-600" />;
      case 'admin':
        return <Shield className="h-5 w-5 text-red-600" />;
      default:
        return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User not found</h1>
          <button
            onClick={() => navigate('/admin/users')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/users')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-700">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    {getRoleIcon()}
                    <span className="text-sm text-gray-500 capitalize">{user.role}</span>
                    {getStatusBadge()}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              {user.role !== 'admin' && (
                <>
                  {user.isBlocked ? (
                    <button
                      onClick={handleUnblockUser}
                      disabled={actionLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Unblock</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleBlockUser}
                      disabled={actionLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                    >
                      <Ban className="h-4 w-4" />
                      <span>Block</span>
                    </button>
                  )}
                  {user.accountStatus !== 'deleted' && (
                    <button
                      onClick={handleDeleteUser}
                      disabled={actionLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="font-medium text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Last Active</p>
                    <p className="font-medium text-gray-900">
                      {new Date(recentActivity.lastLogin).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              {user.bio && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Bio</p>
                  <p className="text-gray-900">{user.bio}</p>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{statistics.totalEnrollments}</div>
                  <div className="text-sm text-gray-500">Enrollments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{statistics.completedCourses}</div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{Math.round(statistics.averageProgress)}%</div>
                  <div className="text-sm text-gray-500">Avg Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{statistics.createdCourses}</div>
                  <div className="text-sm text-gray-500">Created</div>
                </div>
              </div>
            </div>

            {/* Enrolled Courses */}
            {user.enrolledCourses && user.enrolledCourses.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrolled Courses</h3>
                <div className="space-y-3">
                  {user.enrolledCourses.map((enrollment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{enrollment.course.title}</p>
                        <p className="text-sm text-gray-500">
                          Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{enrollment.progress}%</p>
                        {enrollment.certificateIssued && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Certificate
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Created Courses */}
            {createdCourses.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Created Courses</h3>
                <div className="space-y-3">
                  {createdCourses.map((course) => (
                    <div key={course._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{course.title}</p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(course.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          course.status === 'published' ? 'bg-green-100 text-green-800' :
                          course.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          course.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {course.status}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">{course.enrollmentCount} enrollments</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  {getStatusBadge()}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Role</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{user.role}</span>
                </div>
                {user.isBlocked && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Blocked At</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(user.blockedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Block Reason</span>
                      <span className="text-sm font-medium text-gray-900">{user.blockReason}</span>
                    </div>
                  </>
                )}
                {user.accountStatus === 'deleted' && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Deleted At</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(user.deletedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Creator Application */}
            {user.role === 'creator' && user.creatorApplication && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Creator Application</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.creatorApplication.status === 'approved' ? 'bg-green-100 text-green-800' :
                      user.creatorApplication.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.creatorApplication.status}
                    </span>
                  </div>
                  {user.creatorApplication.expertise && (
                    <div>
                      <span className="text-sm text-gray-500">Expertise</span>
                      <p className="text-sm font-medium text-gray-900">{user.creatorApplication.expertise}</p>
                    </div>
                  )}
                  {user.creatorApplication.experience && (
                    <div>
                      <span className="text-sm text-gray-500">Experience</span>
                      <p className="text-sm font-medium text-gray-900">{user.creatorApplication.experience}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Restricted Courses */}
            {user.restrictedCourses && user.restrictedCourses.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Restricted Courses</h3>
                <div className="space-y-2">
                  {user.restrictedCourses.map((course) => (
                    <div key={course._id} className="text-sm text-gray-900">
                      {course.title}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
