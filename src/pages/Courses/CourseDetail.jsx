import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { courseAPI, learnerAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  BookOpen, 
  Star, 
  Clock, 
  Users, 
  Play,
  CheckCircle,
  User,
  Award,
  ArrowLeft
} from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await courseAPI.getCourse(id);
      setCourse(response.data.data.course);
      
      // Check if user is enrolled
      if (isAuthenticated && user?.role === 'learner') {
        try {
          const enrolledResponse = await learnerAPI.getEnrolledCourses();
          const enrolled = enrolledResponse.data.data.some(
            enrollment => enrollment.course._id === id
          );
          setIsEnrolled(enrolled);
        } catch (error) {
          console.error('Error checking enrollment:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Course not found');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'learner') {
      toast.error('Only learners can enroll in courses');
      return;
    }

    setEnrolling(true);
    try {
      await learnerAPI.enrollInCourse(id);
      setIsEnrolled(true);
      toast.success('Successfully enrolled in course!');
    } catch (error) {
      const message = error.response?.data?.message || 'Enrollment failed';
      toast.error(message);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
          <button
            onClick={() => navigate('/courses')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="badge badge-blue">{course.category}</span>
                <span className="text-sm text-gray-500">{course.level}</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-lg text-gray-600 mb-6">{course.shortDescription}</p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span>{course.rating.average.toFixed(1)} ({course.rating.count} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{course.enrollmentCount} students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{course.duration} minutes</span>
                </div>
              </div>
            </div>

            {/* Course Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Course</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
              </div>
            </div>

            {/* What You'll Learn */}
            {course.outcomes && course.outcomes.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">What You'll Learn</h2>
                <ul className="space-y-2">
                  {course.outcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Course Content */}
            {course.lessons && course.lessons.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Course Content ({course.lessons.length} lessons)
                </h2>
                <div className="space-y-2">
                  {course.lessons.map((lesson, index) => (
                    <div key={lesson._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div className="flex items-center">
                        <Play className="h-4 w-4 text-gray-400 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                          {lesson.description && (
                            <p className="text-sm text-gray-600">{lesson.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{lesson.duration} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              {/* Course Thumbnail */}
              <div className="aspect-video bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
                {course.thumbnail?.url ? (
                  <img
                    src={course.thumbnail.url}
                    alt={course.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <BookOpen className="h-16 w-16 text-gray-400" />
                )}
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${course.price}
                </div>
                {course.price > 0 && (
                  <p className="text-sm text-gray-600">One-time payment</p>
                )}
              </div>

              {/* Enroll Button */}
              <div className="mb-6">
                {isAuthenticated ? (
                  user?.role === 'learner' ? (
                    isEnrolled ? (
                      <button
                        onClick={() => navigate(`/learner/courses/${course._id}/learn`)}
                        className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold flex items-center justify-center hover:bg-blue-700"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Start Learning
                      </button>
                    ) : (
                      <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {enrolling ? 'Enrolling...' : 'Enroll Now'}
                      </button>
                    )
                  ) : (
                    <div className="text-center text-gray-600">
                      <p className="mb-2">Only learners can enroll in courses</p>
                      {user?.role === 'creator' && (
                        <p className="text-sm">Switch to learner account to enroll</p>
                      )}
                    </div>
                  )
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Login to Enroll
                  </button>
                )}
              </div>

              {/* Course Info */}
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{course.duration} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Lessons</span>
                  <span className="font-medium">{course.lessons?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Level</span>
                  <span className="font-medium">{course.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Certificate</span>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-green-500 mr-1" />
                    <span className="font-medium">Yes</span>
                  </div>
                </div>
              </div>

              {/* Instructor */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Instructor</h3>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{course.creator.name}</div>
                    {course.creator.bio && (
                      <div className="text-sm text-gray-600 line-clamp-2">{course.creator.bio}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;