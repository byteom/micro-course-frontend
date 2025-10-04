import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { creatorAPI } from '../../services/api';
import { 
  Play, 
  Upload, 
  X, 
  Plus, 
  Save,
  ArrowLeft,
  Clock,
  FileText,
  Trash2,
  Edit,
  Eye,
  GripVertical,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const LessonManager = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [course, setCourse] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
    duration: 5,
    notes: '',
    resources: []
  });
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [newResource, setNewResource] = useState({ title: '', url: '', type: 'link' });
  const [transcriptionStatus, setTranscriptionStatus] = useState({});

  useEffect(() => {
    fetchCourseAndLessons();
  }, [courseId]);

  const fetchCourseAndLessons = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseResponse = await creatorAPI.getMyCourses();
      const courseData = courseResponse.data.data.courses.find(c => c._id === courseId);
      
      if (!courseData) {
        toast.error('Course not found');
        navigate('/creator/dashboard');
        return;
      }

      setCourse(courseData);
      
      // Fetch lessons from API
      const lessonsResponse = await creatorAPI.getCourseLessons(courseId);
      const lessonsData = lessonsResponse.data.data.lessons;
      setLessons(lessonsData);
      
      // Calculate next order
      const nextOrder = lessonsData.length + 1;
      setFormData(prev => ({ ...prev, order: nextOrder }));
      
    } catch (error) {
      console.error('Error fetching course and lessons:', error);
      toast.error('Failed to load course');
      navigate('/creator/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) { // 500MB limit
        toast.error('Video size must be less than 500MB');
        return;
      }
      
      setVideoFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Thumbnail size must be less than 10MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      setThumbnailFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    }
  };

  const addResource = () => {
    if (newResource.title.trim() && newResource.url.trim()) {
      setFormData({
        ...formData,
        resources: [...formData.resources, { ...newResource }]
      });
      setNewResource({ title: '', url: '', type: 'link' });
    }
  };

  const removeResource = (index) => {
    setFormData({
      ...formData,
      resources: formData.resources.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Lesson title is required');
      return;
    }

    if (!formData.duration || formData.duration < 1) {
      toast.error('Duration must be at least 1 minute');
      return;
    }

    if (!videoFile && !editingLesson) {
      toast.error('Video file is required');
      return;
    }

    if (!videoFile && editingLesson && !editingLesson.video?.url) {
      toast.error('Video file is required');
      return;
    }

    setSaving(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('order', formData.order);
      submitData.append('duration', formData.duration);
      submitData.append('notes', formData.notes);
      submitData.append('resources', JSON.stringify(formData.resources));

      if (videoFile) {
        submitData.append('video', videoFile);
      }

      if (thumbnailFile) {
        submitData.append('thumbnail', thumbnailFile);
      }

      if (editingLesson) {
        await creatorAPI.updateLesson(editingLesson._id, submitData);
        toast.success('Lesson updated successfully!');
      } else {
        await creatorAPI.createLesson(courseId, submitData);
        toast.success('Lesson created successfully!');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        order: lessons.length + 2, // +2 because we just added one lesson
        duration: 5,
        notes: '',
        resources: []
      });
      setVideoFile(null);
      setVideoPreview(null);
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setShowCreateForm(false);
      setEditingLesson(null);
      
      // Refresh lessons
      await fetchCourseAndLessons();
      
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save lesson';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      order: lesson.order,
      duration: lesson.duration || 5,
      notes: lesson.notes || '',
      resources: lesson.resources || []
    });
    
    // Set current video preview if exists
    if (lesson.video?.url) {
      setVideoPreview(lesson.video.url);
    } else {
      setVideoPreview(null);
    }
    
    // Set current thumbnail preview if exists
    if (lesson.thumbnail?.url) {
      setThumbnailPreview(lesson.thumbnail.url);
    } else {
      setThumbnailPreview(null);
    }
    
    // Clear file inputs (user needs to select new files if they want to change)
    setVideoFile(null);
    setThumbnailFile(null);
    
    setShowCreateForm(true);
  };

  const handleDelete = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      await creatorAPI.deleteLesson(lessonId);
      toast.success('Lesson deleted successfully!');
      await fetchCourseAndLessons();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete lesson';
      toast.error(message);
    }
  };

  const generateTranscription = async (lessonId) => {
    try {
      setTranscriptionStatus(prev => ({ ...prev, [lessonId]: 'processing' }));
      
      // This would call the actual transcription API
      await creatorAPI.generateTranscription(lessonId);
      
      toast.success('Transcription generated successfully!');
      setTranscriptionStatus(prev => ({ ...prev, [lessonId]: 'completed' }));
      
      // Refresh lessons to get updated transcript
      await fetchCourseAndLessons();
      
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate transcription';
      toast.error(message);
      setTranscriptionStatus(prev => ({ ...prev, [lessonId]: 'error' }));
    }
  };

  const cancelEdit = () => {
    setFormData({
      title: '',
      description: '',
      order: lessons.length + 1,
      duration: 5,
      notes: '',
      resources: []
    });
    setVideoFile(null);
    setVideoPreview(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setShowCreateForm(false);
    setEditingLesson(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(`/creator/courses/${courseId}/edit`)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Course
            </button>
            
            <button
              onClick={() => {
                setEditingLesson(null);
                setFormData({
                  title: '',
                  description: '',
                  order: lessons.length + 1,
                  duration: 5,
                  notes: '',
                  resources: []
                });
                setVideoFile(null);
                setVideoPreview(null);
                setThumbnailFile(null);
                setThumbnailPreview(null);
                setShowCreateForm(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Lessons</h1>
          <p className="text-gray-600">{course?.title}</p>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
              </h2>
              <button
                onClick={cancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter lesson title"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    id="order"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what students will learn in this lesson"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  max="300"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter lesson duration in minutes"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">Enter the estimated duration of this lesson</p>
              </div>

              <div>
                <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-2">
                  Video File {!editingLesson && '*'}
                  {editingLesson && (
                    <span className="text-sm text-gray-500 font-normal ml-2">
                      (Optional - leave empty to keep current video)
                    </span>
                  )}
                </label>
                <input
                  type="file"
                  id="video"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required={!editingLesson}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Max size: 500MB
                  {editingLesson && (
                    <span className="block text-blue-600 mt-1">
                      💡 Select a new file only if you want to replace the current video
                    </span>
                  )}
                </p>
                
                {videoPreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {editingLesson ? 'Current Video:' : 'Preview:'}
                    </p>
                    <video
                      src={videoPreview}
                      controls
                      className="w-full max-w-md h-48 object-cover rounded-lg border"
                    />
                    {editingLesson && (
                      <p className="text-xs text-gray-500 mt-2">
                        This is the current video. Upload a new file above to replace it.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail Image (Optional)
                  {editingLesson && (
                    <span className="text-sm text-gray-500 font-normal ml-2">
                      (Leave empty to keep current thumbnail)
                    </span>
                  )}
                </label>
                <input
                  type="file"
                  id="thumbnail"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Max size: 10MB (JPG, PNG, WebP)
                  {editingLesson && (
                    <span className="block text-blue-600 mt-1">
                      💡 Select a new image only if you want to replace the current thumbnail
                    </span>
                  )}
                </p>
                
                {thumbnailPreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {editingLesson ? 'Current Thumbnail:' : 'Preview:'}
                    </p>
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg border"
                    />
                    {editingLesson && (
                      <p className="text-xs text-gray-500 mt-2">
                        This is the current thumbnail. Upload a new image above to replace it.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Instructor Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Private notes for yourself (not visible to students)"
                />
              </div>

              {/* Resources */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Resources
                </label>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newResource.title}
                      onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Resource title"
                    />
                    <input
                      type="url"
                      value={newResource.url}
                      onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Resource URL"
                    />
                    <select
                      value={newResource.type}
                      onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="link">Link</option>
                      <option value="pdf">PDF</option>
                      <option value="file">File</option>
                      <option value="other">Other</option>
                    </select>
                    <button
                      type="button"
                      onClick={addResource}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {formData.resources.length > 0 && (
                    <div className="space-y-2">
                      {formData.resources.map((resource, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-700">{resource.title}</span>
                            <span className="text-sm text-gray-500">({resource.type})</span>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              {resource.url}
                            </a>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeResource(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingLesson ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingLesson ? 'Update Lesson' : 'Create Lesson'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lessons List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Lessons ({lessons.length})</h2>
          </div>
          
          {lessons.length === 0 ? (
            <div className="p-8 text-center">
              <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons yet</h3>
              <p className="text-gray-600 mb-4">Add your first lesson to get started</p>
              <button
                onClick={() => {
                  setEditingLesson(null);
                  setFormData({
                    title: '',
                    description: '',
                    order: 1,
                    duration: 5,
                    notes: '',
                    resources: []
                  });
                  setVideoFile(null);
                  setVideoPreview(null);
                  setThumbnailFile(null);
                  setThumbnailPreview(null);
                  setShowCreateForm(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center mx-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Lesson
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {lessons.map((lesson, index) => (
                <div key={lesson._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Play className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900">{lesson.title}</h3>
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
                          {lesson.resources && lesson.resources.length > 0 && (
                            <span className="text-sm text-gray-500 flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              {lesson.resources.length} resources
                            </span>
                          )}
                        </div>
                        
                        {/* Transcription Status */}
                        <div className="mt-2">
                          {lesson.transcript ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Transcript Available
                            </span>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                No Transcript
                              </span>
                              <button
                                onClick={() => generateTranscription(lesson._id)}
                                disabled={transcriptionStatus[lesson._id] === 'processing'}
                                className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                              >
                                {transcriptionStatus[lesson._id] === 'processing' ? 'Generating...' : 'Generate Transcript'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(lesson)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Edit lesson"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="View lesson"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(lesson._id)}
                        className="p-2 text-red-400 hover:text-red-600"
                        title="Delete lesson"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonManager;
