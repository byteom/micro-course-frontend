import React, { useState, useEffect } from 'react';
import Loader from '../../components/Loader';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { 
  ArrowLeft,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  DollarSign,
  BookOpen,
  Play,
  Star,
  Tag,
  AlertCircle,
  Send,
  FileText,
  Calendar,
  Award,
  Users,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import toast from 'react-hot-toast';

const CourseReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [reviewType, setReviewType] = useState('approve'); // 'approve' or 'reject'
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      
      // Potentially fetch related data in parallel in the future
      const courseResponse = await adminAPI.getCourseDetails(id);
      const courseData = courseResponse.data.data;
      setCourse(courseData);
      setCreator(courseData.creator);
      setLessons(courseData.lessons || []);
      
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course details');
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!feedback.trim()) {
      toast.error('Please provide feedback for approval');
      return;
    }

    setReviewLoading(true);
    try {
      await adminAPI.approveCourse(id, feedback);
      toast.success('Course approved successfully!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error approving course:', error);
      toast.error('Failed to approve course');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      toast.error('Please provide feedback explaining why the course was rejected');
      return;
    }

    setReviewLoading(true);
    try {
      await adminAPI.rejectCourse(id, feedback);
      toast.success('Course rejected with feedback sent to creator');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error rejecting course:', error);
      toast.error('Failed to reject course');
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending_review':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4" />;
      case 'submitted':
      case 'pending_review':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader label="Loading course details..." size={48} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
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
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Dashboard
            </button>
            
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(course.status)}`}>
                {getStatusIcon(course.status)}
                <span className="ml-1 capitalize">{course.status.replace('_', ' ')}</span>
              </span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Review</h1>
          <p className="text-gray-600">Review course details and provide feedback</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {creator?.name || 'Unknown Creator'}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(course.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${course.price || 0}
                    </div>
                  </div>
                </div>
                
                {course.thumbnail?.url && (
                  <div className="ml-6">
                    <img
                      src={course.thumbnail.url}
                      alt="Course thumbnail"
                      className="w-32 h-20 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Category</p>
                      <p className="text-lg font-bold text-blue-900">{course.category || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Award className="h-6 w-6 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Level</p>
                      <p className="text-lg font-bold text-green-900">{course.level || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Play className="h-6 w-6 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Lessons</p>
                      <p className="text-lg font-bold text-purple-900">{lessons.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{course.description || 'No description provided'}</p>
                </div>

                {course.shortDescription && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Short Description</h3>
                    <p className="text-gray-700">{course.shortDescription}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tags, Requirements, Outcomes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h3>
              
              <div className="space-y-6">
                {course.tags && Array.isArray(course.tags) && course.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Tag className="h-4 w-4 mr-2" />
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {course.requirements && Array.isArray(course.requirements) && course.requirements.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                    <ul className="space-y-1">
                      {course.requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-gray-400 mr-2 mt-1">•</span>
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {course.outcomes && Array.isArray(course.outcomes) && course.outcomes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Learning Outcomes</h4>
                    <ul className="space-y-1">
                      {course.outcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-gray-400 mr-2 mt-1">•</span>
                          <span className="text-gray-700">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Lessons */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lessons ({lessons.length})</h3>
              
              {lessons.length === 0 ? (
                <div className="text-center py-8">
                  <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No lessons found</h4>
                  <p className="text-gray-600">This course doesn't have any lessons yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lessons.map((lesson, index) => (
                    <div key={lesson._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Play className="h-6 w-6 text-gray-400" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-lg font-medium text-gray-900">{lesson.title}</h4>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                #{lesson.order}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-500 flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {lesson.duration} min
                              </span>
                              {lesson.isFree && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Free
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {lesson.video?.url && (
                          <button
                            onClick={() => window.open(lesson.video.url, '_blank')}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Video
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Review Panel */}
          <div className="space-y-6">
            {/* Creator Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Creator Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{creator?.name || 'Unknown Creator'}</h4>
                    <p className="text-sm text-gray-600">{creator?.email || 'No email'}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Role:</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{creator?.role || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      creator?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {creator?.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Actions</h3>
              
              {!showFeedbackForm ? (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setReviewType('approve');
                      setShowFeedbackForm(true);
                    }}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Approve Course
                  </button>
                  
                  <button
                    onClick={() => {
                      setReviewType('reject');
                      setShowFeedbackForm(true);
                    }}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center"
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Reject Course
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                      {reviewType === 'approve' ? 'Approval Feedback' : 'Rejection Feedback'} *
                    </label>
                    <textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={
                        reviewType === 'approve' 
                          ? 'Provide positive feedback about what makes this course good...'
                          : 'Explain what needs to be improved or why the course is being rejected...'
                      }
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowFeedbackForm(false);
                        setFeedback('');
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    
                    <button
                      onClick={reviewType === 'approve' ? handleApprove : handleReject}
                      disabled={reviewLoading || !feedback.trim()}
                      className={`flex-1 px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                        reviewType === 'approve' 
                          ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                          : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      }`}
                    >
                      {reviewLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {reviewType === 'approve' ? 'Approving...' : 'Rejecting...'}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          {reviewType === 'approve' ? 'Approve & Send' : 'Reject & Send'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Course Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Statistics</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Duration:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {course.duration ? `${Math.floor(course.duration / 60)}h ${course.duration % 60}m` : '0m'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Enrollments:</span>
                  <span className="text-sm font-medium text-gray-900">{course.enrollmentCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rating:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {course.rating?.average ? `${course.rating.average.toFixed(1)}/5` : 'No ratings'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue:</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${((course.enrollmentCount || 0) * course.price).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseReview;
