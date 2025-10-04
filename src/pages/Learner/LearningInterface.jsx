import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { learnerAPI, courseAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Award,
  ArrowLeft,
  ArrowRight,
  Download,
  Eye
} from 'lucide-react';

const LearningInterface = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [videoProgress, setVideoProgress] = useState({});
  const [lastWatchedLesson, setLastWatchedLesson] = useState(null);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseResponse = await courseAPI.getCourse(courseId);
      setCourse(courseResponse.data.data.course);
      
      // Fetch lessons
      const lessonsResponse = await learnerAPI.getCourseLessons(courseId);
      setLessons(lessonsResponse.data.data.lessons);
      
      // Fetch progress
      const progressResponse = await learnerAPI.getCourseProgress(courseId);
      setProgress(progressResponse.data.data);
      
      // Load saved video progress
      loadVideoProgress();
      
      // Set current lesson - prioritize last watched lesson
      if (lessonsResponse.data.data.lessons.length > 0) {
        const lastWatched = getLastWatchedLesson();
        if (lastWatched) {
          setCurrentLesson(lastWatched);
          setLastWatchedLesson(lastWatched);
        } else {
          setCurrentLesson(lessonsResponse.data.data.lessons[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error('Failed to load course');
      navigate('/learner/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Load video progress from localStorage
  const loadVideoProgress = () => {
    const savedProgress = localStorage.getItem(`videoProgress_${courseId}`);
    if (savedProgress) {
      try {
        setVideoProgress(JSON.parse(savedProgress));
      } catch (error) {
        console.error('Error loading video progress:', error);
      }
    }
  };

  // Save video progress to localStorage
  const saveVideoProgress = (lessonId, currentTime, duration) => {
    const progressData = {
      ...videoProgress,
      [lessonId]: {
        currentTime,
        duration,
        lastWatched: new Date().toISOString()
      }
    };
    setVideoProgress(progressData);
    localStorage.setItem(`videoProgress_${courseId}`, JSON.stringify(progressData));
  };

  // Get last watched lesson
  const getLastWatchedLesson = () => {
    const savedProgress = localStorage.getItem(`videoProgress_${courseId}`);
    if (savedProgress) {
      try {
        const progressData = JSON.parse(savedProgress);
        const lessonEntries = Object.entries(progressData);
        if (lessonEntries.length > 0) {
          // Find the most recently watched lesson
          const lastWatched = lessonEntries.reduce((latest, [lessonId, data]) => {
            if (!latest || new Date(data.lastWatched) > new Date(latest.lastWatched)) {
              return { lessonId, ...data };
            }
            return latest;
          }, null);
          
          // Find the lesson object
          return lessons.find(lesson => lesson._id === lastWatched.lessonId);
        }
      } catch (error) {
        console.error('Error getting last watched lesson:', error);
      }
    }
    return null;
  };

  const handleLessonComplete = async () => {
    if (!currentLesson) return;
    
    setCompletingLesson(true);
    try {
      await learnerAPI.completeLesson(courseId, currentLesson._id);
      
      // Update progress
      const progressResponse = await learnerAPI.getCourseProgress(courseId);
      setProgress(progressResponse.data.data);
      
      toast.success('Lesson completed!');
      
      // Move to next lesson if available
      const currentIndex = lessons.findIndex(lesson => lesson._id === currentLesson._id);
      if (currentIndex < lessons.length - 1) {
        setCurrentLesson(lessons[currentIndex + 1]);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to complete lesson';
      toast.error(message);
    } finally {
      setCompletingLesson(false);
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      const response = await learnerAPI.getCertificate(courseId);
      
      // Create blob from response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${courseId}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    }
  };

  const handlePreviewCertificate = async () => {
    try {
      const response = await learnerAPI.getCertificatePreview(courseId);
      
      // Open certificate preview in new window
      const newWindow = window.open('', '_blank');
      newWindow.document.write(response.data);
      newWindow.document.close();
    } catch (error) {
      console.error('Error previewing certificate:', error);
      toast.error('Failed to preview certificate');
    }
  };

  const isLessonCompleted = (lessonId) => {
    if (!progress?.completedLessons || !Array.isArray(progress.completedLessons)) {
      return false;
    }
    return progress.completedLessons.includes(lessonId);
  };

  const getNextLesson = () => {
    const currentIndex = lessons.findIndex(lesson => lesson._id === currentLesson?._id);
    return currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  };

  const getPreviousLesson = () => {
    const currentIndex = lessons.findIndex(lesson => lesson._id === currentLesson?._id);
    return currentIndex > 0 ? lessons[currentIndex - 1] : null;
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
            onClick={() => navigate('/learner/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/learner/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-sm text-gray-500">by {course.creator?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Progress: {progress?.progress || 0}%
              </div>
              {lastWatchedLesson && lastWatchedLesson._id !== currentLesson?._id && (
                <button
                  onClick={() => setCurrentLesson(lastWatchedLesson)}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  <Play className="h-4 w-4" />
                  <span>Resume from last position</span>
                </button>
              )}
              {progress?.certificateIssued && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePreviewCertificate}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={handleDownloadCertificate}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Lessons Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lessons</h3>
              <div className="space-y-2">
                {lessons.map((lesson, index) => {
                  const lessonProgress = videoProgress[lesson._id];
                  const progressPercentage = lessonProgress 
                    ? Math.round((lessonProgress.currentTime / lessonProgress.duration) * 100)
                    : 0;
                  const isLastWatched = lastWatchedLesson?._id === lesson._id;
                  
                  return (
                    <button
                      key={lesson._id}
                      onClick={() => setCurrentLesson(lesson)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        currentLesson?._id === lesson._id
                          ? 'bg-blue-100 border-blue-500 border-2'
                          : isLastWatched
                          ? 'bg-yellow-50 border-yellow-300 border'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {isLessonCompleted(lesson._id) ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <Play className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {index + 1}. {lesson.title}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {lesson.duration} min
                              </p>
                              {lessonProgress && progressPercentage > 0 && (
                                <p className="text-xs text-blue-600">
                                  {progressPercentage}% watched
                                </p>
                              )}
                            </div>
                            {lessonProgress && progressPercentage > 0 && progressPercentage < 100 && (
                              <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                                <div 
                                  className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                  style={{ width: `${progressPercentage}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </div>
                        {isLastWatched && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentLesson ? (
              <div className="bg-white rounded-lg shadow-sm">
                {/* Video Player */}
                <div className="aspect-video bg-black rounded-t-lg">
                  <video
                    src={currentLesson.video.url}
                    controls
                    className="w-full h-full rounded-t-lg"
                    onTimeUpdate={(e) => {
                      const video = e.target;
                      if (video.duration > 0) {
                        saveVideoProgress(currentLesson._id, video.currentTime, video.duration);
                      }
                    }}
                    onLoadedData={(e) => {
                      const video = e.target;
                      const savedProgress = videoProgress[currentLesson._id];
                      if (savedProgress && savedProgress.currentTime > 0) {
                        video.currentTime = savedProgress.currentTime;
                      }
                    }}
                    onEnded={() => {
                      // Auto-mark lesson as completed when video ends
                      if (!isLessonCompleted(currentLesson._id)) {
                        handleLessonComplete();
                      }
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>

                {/* Lesson Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {currentLesson.title}
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{currentLesson.duration} minutes</span>
                    </div>
                  </div>

                  {currentLesson.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-700">{currentLesson.description}</p>
                    </div>
                  )}

                  {/* Lesson Resources */}
                  {currentLesson.resources && currentLesson.resources.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Resources</h3>
                      <div className="space-y-2">
                        {currentLesson.resources.map((resource, index) => (
                          <a
                            key={index}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                          >
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-gray-900">{resource.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation and Complete Button */}
                  <div className="flex items-center justify-between pt-6 border-t">
                    <div className="flex space-x-4">
                      {getPreviousLesson() && (
                        <button
                          onClick={() => setCurrentLesson(getPreviousLesson())}
                          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>Previous</span>
                        </button>
                      )}
                    </div>

                    <div className="flex space-x-4">
                      {!isLessonCompleted(currentLesson._id) && (
                        <button
                          onClick={handleLessonComplete}
                          disabled={completingLesson}
                          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>{completingLesson ? 'Completing...' : 'Mark Complete'}</span>
                        </button>
                      )}

                      {getNextLesson() && (
                        <button
                          onClick={() => setCurrentLesson(getNextLesson())}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          <span>Next</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No lessons available</h3>
                <p className="text-gray-500">This course doesn't have any lessons yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningInterface;
