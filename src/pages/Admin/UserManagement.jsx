import React, { useState, useEffect } from 'react';
import Loader from '../../components/Loader';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  User, 
  Search, 
  Filter,
  Eye,
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  ArrowLeft
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active tab based on route
  const getInitialTab = () => {
    if (location.pathname.includes('/learners')) return 'learners';
    if (location.pathname.includes('/creators')) return 'creators';
    return 'learners'; // default
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [learners, setLearners] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [learnersPagination, setLearnersPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [creatorsPagination, setCreatorsPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [learnersTotal, setLearnersTotal] = useState(0);
  const [creatorsTotal, setCreatorsTotal] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [activeTab, searchTerm, statusFilter, learnersPagination.page, creatorsPagination.page]);

  // Fetch totals for both tabs on mount and when filters change
  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const baseParams = {
          page: 1,
          limit: 1,
          search: searchTerm,
          status: statusFilter === 'all' ? undefined : statusFilter
        };
        const [learnersRes, creatorsRes] = await Promise.all([
          adminAPI.getAllLearners(baseParams),
          adminAPI.getAllCreators(baseParams)
        ]);
        setLearnersTotal(learnersRes.data.data.pagination?.total || 0);
        setCreatorsTotal(creatorsRes.data.data.pagination?.total || 0);
        // Also sync totals into paginations without altering pages
        setLearnersPagination(prev => ({ ...prev, total: learnersRes.data.data.pagination?.total || prev.total }));
        setCreatorsPagination(prev => ({ ...prev, total: creatorsRes.data.data.pagination?.total || prev.total }));
      } catch (e) {
        // ignore totals error silently
      }
    };
    fetchTotals();
  }, [searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const currentPage = activeTab === 'learners' ? learnersPagination.page : creatorsPagination.page;
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter
      };

      if (activeTab === 'learners') {
        const response = await adminAPI.getAllLearners(params);
        setLearners(response.data.data.learners);
        setLearnersPagination(response.data.data.pagination);
      } else {
        const response = await adminAPI.getAllCreators(params);
        setCreators(response.data.data.creators);
        setCreatorsPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, reason) => {
    if (!reason) {
      toast.error('Please provide a reason for blocking');
      return;
    }

    try {
      await adminAPI.blockUser(userId, reason);
      toast.success('User blocked successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to block user');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await adminAPI.unblockUser(userId);
      toast.success('User unblocked successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to unblock user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const getStatusBadge = (user) => {
    if (user.accountStatus === 'deleted') {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Deleted</span>;
    }
    if (user.isBlocked) {
      return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Blocked</span>;
    }
    return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>;
  };

  const UserActions = ({ user }) => {
    const [showActions, setShowActions] = useState(false);
    const [blockReason, setBlockReason] = useState('');

    return (
      <div className="relative">
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {showActions && (
          <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg z-10 min-w-48">
            <div className="p-2">
              <button
                onClick={() => {
                  navigate(`/admin/users/${user._id}/details`);
                  setShowActions(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </button>

              {user.isBlocked ? (
                <button
                  onClick={() => {
                    handleUnblockUser(user._id);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center space-x-2 text-green-600"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Unblock</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    const reason = prompt('Enter reason for blocking:');
                    if (reason) {
                      handleBlockUser(user._id, reason);
                      setShowActions(false);
                    }
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center space-x-2 text-orange-600"
                >
                  <Ban className="h-4 w-4" />
                  <span>Block</span>
                </button>
              )}

              {user.accountStatus !== 'deleted' && (
                <button
                  onClick={() => {
                    handleDeleteUser(user._id);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center space-x-2 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderUserTable = (users, isLearner = true) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {isLearner ? 'Enrollments' : 'Courses'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progress
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(user)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {isLearner ? user.stats?.totalEnrollments || 0 : user.stats?.totalCourses || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {isLearner ? 
                  `${Math.round(user.stats?.averageProgress || 0)}%` : 
                  `${user.stats?.publishedCourses || 0} published`
                }
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <UserActions user={user} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage learners and creators
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab('learners');
                  setLearnersPagination(prev => ({ ...prev, page: 1 }));
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'learners'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>Learners ({learnersTotal})</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('creators');
                  setCreatorsPagination(prev => ({ ...prev, page: 1 }));
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'creators'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Creators ({creatorsTotal})</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg">
          {loading ? (
            <Loader label="Loading users..." />
          ) : (
            <>
              {renderUserTable(activeTab === 'learners' ? learners : creators, activeTab === 'learners')}
              
              {/* Pagination */}
              {(activeTab === 'learners' ? learnersPagination.pages : creatorsPagination.pages) > 1 && (
                <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    {activeTab === 'learners'
                      ? `Showing page ${learnersPagination.page} of ${learnersPagination.pages}`
                      : `Showing page ${creatorsPagination.page} of ${creatorsPagination.pages}`}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => activeTab === 'learners'
                        ? setLearnersPagination({ ...learnersPagination, page: learnersPagination.page - 1 })
                        : setCreatorsPagination({ ...creatorsPagination, page: creatorsPagination.page - 1 })}
                      disabled={(activeTab === 'learners' ? learnersPagination.page : creatorsPagination.page) === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => activeTab === 'learners'
                        ? setLearnersPagination({ ...learnersPagination, page: learnersPagination.page + 1 })
                        : setCreatorsPagination({ ...creatorsPagination, page: creatorsPagination.page + 1 })}
                      disabled={(activeTab === 'learners'
                        ? learnersPagination.page === learnersPagination.pages
                        : creatorsPagination.page === creatorsPagination.pages)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
