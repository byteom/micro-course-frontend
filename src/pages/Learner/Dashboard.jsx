import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { learnerAPI, courseAPI } from '../../services/api';
import { 
  BookOpen, 
  Award, 
  Clock, 
  TrendingUp,
  Star,
  Play,
  CheckCircle
} from 'lucide-react';

const LearnerDashboard = () => {
  const [stats, setStats] = useState({ totalEnrolled: 0, completedCourses: 0, totalLearningTime: 0, averageProgress: 0 });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState({
    stats: true,
    courses: true,
    recommendations: true
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setError(null);
    console.log('Starting dashboard data fetch...');
    
    // Fetch stats
    fetchStats();
    
    // Fetch enrolled courses
    fetchEnrolledCourses();
    
    // Fetch recommendations
    fetchRecommendations();
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching learning stats...');
      const response = await learnerAPI.getLearningStats();
      console.log('Stats loaded:', response.data.data);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({ totalEnrolled: 0, completedCourses: 0, totalLearningTime: 0, averageProgress: 0 });
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      console.log('Fetching enrolled courses...');
      const response = await learnerAPI.getEnrolledCourses();
      console.log('Enrolled courses loaded:', response.data.data);
      setEnrolledCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      setEnrolledCourses([]);
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }
  };

  const fetchRecommendations = async () => {
    try {
      console.log('Fetching recommendations...');
      const response = await learnerAPI.getRecommendations();
      console.log('Recommendations loaded:', response.data.data);
      setRecommendations(response.data.data);
    } catch (error) {
      console.error('Error fetching recommendations, trying popular courses...');
      try {
        const fallbackResponse = await courseAPI.getCourses({ limit: 6, sort: 'popular' });
        console.log('Popular courses loaded as fallback:', fallbackResponse.data.data.courses);
        setRecommendations(fallbackResponse.data.data.courses || []);
      } catch (fallbackError) {
        console.error('Error fetching popular courses:', fallbackError);
        setRecommendations([]);
      }
    } finally {
      setLoading(prev => ({ ...prev, recommendations: false }));
    }
  };

  const isFullyLoaded = !loading.stats && !loading.courses && !loading.recommendations;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Learning Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your progress and continue learning</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalEnrolled || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.completedCourses || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Learning Time</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round((stats?.totalLearningTime || 0) / 60)}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(stats?.averageProgress || 0)}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enrolled Courses */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
              <Link
                to="/learner/courses"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            {enrolledCourses.length > 0 ? (
              <div className="space-y-4">
                {enrolledCourses.slice(0, 3).map((enrollment) => (
                  <div key={enrollment._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {enrollment.course.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {enrollment.course.category} • {enrollment.course.level}
                        </p>
                      </div>
                      <div className="ml-4">
                        {enrollment.certificateIssued ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Award className="h-3 w-3 mr-1" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            In Progress
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <Link
                      to={`/learner/courses/${enrollment.course._id}/learn`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Continue Learning
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                <p className="text-gray-600 mb-4">Start your learning journey today</p>
                <Link
                  to="/courses"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Browse Courses
                </Link>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
              <Link
                to="/courses"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.slice(0, 3).map((course) => (
                  <div key={course._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        {course.thumbnail?.url ? (
                          <img
                            src={course.thumbnail.url}
                            alt={course.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <BookOpen className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {course.category} • {course.level}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            <span>{course.rating.average.toFixed(1)}</span>
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            ${course.price}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/courses/${course._id}`}
                      className="mt-3 block w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Course
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
                <p className="text-gray-600">Enroll in courses to get personalized recommendations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerDashboard;