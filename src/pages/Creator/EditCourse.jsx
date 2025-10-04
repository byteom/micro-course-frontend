import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { creatorAPI } from '../../services/api';
import { 
  BookOpen, 
  Upload, 
  X, 
  Plus, 
  Save,
  Eye,
  ArrowLeft,
  Play,
  Clock,
  Users,
  Star,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    level: '',
    price: '',
    tags: [],
    requirements: [],
    outcomes: []
  });
  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newOutcome, setNewOutcome] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  
  // Lesson creation state
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    duration: 5,
    notes: '',
    resources: []
  });
  const [lessonVideoFile, setLessonVideoFile] = useState(null);
  const [lessonThumbnailFile, setLessonThumbnailFile] = useState(null);
  const [lessonVideoPreview, setLessonVideoPreview] = useState(null);
  const [lessonThumbnailPreview, setLessonThumbnailPreview] = useState(null);
  const [lessonSaving, setLessonSaving] = useState(false);
  const [newResource, setNewResource] = useState({ title: '', url: '', type: 'link' });

  const categories = [
    'Programming', 'Design', 'Business', 'Marketing', 
    'Photography', 'Music', 'Health', 'Language', 'Other'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await creatorAPI.getMyCourses();
      const courseData = response.data.data.courses.find(c => c._id === id);
      
      if (!courseData) {
        toast.error('Course not found');
        navigate('/creator/dashboard');
        return;
      }

      setCourse(courseData);
      setFormData({
        title: courseData.title || '',
        description: courseData.description || '',
        shortDescription: courseData.shortDescription || '',
        category: courseData.category || '',
        level: courseData.level || '',
        price: courseData.price || '',
        tags: courseData.tags || [],
        requirements: courseData.requirements || [],
        outcomes: courseData.outcomes || []
      });

      if (courseData.thumbnail?.url) {
        setThumbnailPreview(courseData.thumbnail.url);
      }

      // Fetch lessons
      await fetchLessons();
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course');
      navigate('/creator/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const lessonsResponse = await creatorAPI.getCourseLessons(id);
      const lessonsData = lessonsResponse.data.data.lessons;
      setLessons(lessonsData);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setLessons([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Thumbnail size must be less than 5MB');
        return;
      }
      
      setThumbnail(file);
      const reader = new FileReader();
      reader.onload = (e) => setThumbnailPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };

  const removeRequirement = (reqToRemove) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter(req => req !== reqToRemove)
    });
  };

  const addOutcome = () => {
    if (newOutcome.trim()) {
      setFormData({
        ...formData,
        outcomes: [...formData.outcomes, newOutcome.trim()]
      });
      setNewOutcome('');
    }
  };

  const removeOutcome = (outcomeToRemove) => {
    setFormData({
      ...formData,
      outcomes: formData.outcomes.filter(outcome => outcome !== outcomeToRemove)
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required';
    }

    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = 'Short description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.level) {
      newErrors.level = 'Level is required';
    }

    if (!formData.price || formData.price < 0) {
      newErrors.price = 'Valid price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setActiveTab('details');
      return;
    }

    setSaving(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('shortDescription', formData.shortDescription);
      submitData.append('category', formData.category);
      submitData.append('level', formData.level);
      submitData.append('price', formData.price);
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('requirements', JSON.stringify(formData.requirements));
      submitData.append('outcomes', JSON.stringify(formData.outcomes));

      if (thumbnail) {
        submitData.append('thumbnail', thumbnail);
      }

      await creatorAPI.updateCourse(id, submitData);
      toast.success('Course updated successfully!');
      
      // Refresh course data
      await fetchCourse();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update course';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!validateForm()) {
      setActiveTab('details');
      return;
    }

    if (lessons.length === 0) {
      toast.error('Please add at least one lesson before submitting for review');
      setActiveTab('lessons');
      return;
    }

    setSaving(true);

    try {
      // First, save all course changes including thumbnail
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('shortDescription', formData.shortDescription);
      submitData.append('category', formData.category);
      submitData.append('level', formData.level);
      submitData.append('price', formData.price);
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('requirements', JSON.stringify(formData.requirements));
      submitData.append('outcomes', JSON.stringify(formData.outcomes));

      if (thumbnail) {
        submitData.append('thumbnail', thumbnail);
      }

      // Update the course with all changes
      await creatorAPI.updateCourse(id, submitData);
      
      // Then submit for review
      await creatorAPI.submitCourse(id);
      toast.success('Course updated and submitted for review!');
      
      // Refresh course data
      await fetchCourse();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit course for review';
      toast.error(message);
    } finally {
      setSaving(false);
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4" />;
      case 'submitted':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Edit className="h-4 w-4" />;
    }
  };

  // Lesson creation functions
  const handleLessonChange = (e) => {
    const { name, value } = e.target;
    setLessonFormData({
      ...lessonFormData,
      [name]: value
    });
  };

  const handleLessonVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) { // 500MB limit
        toast.error('Video size must be less than 500MB');
        return;
      }
      
      setLessonVideoFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setLessonVideoPreview(url);
    }
  };

  const handleLessonThumbnailChange = (e) => {
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
      
      setLessonThumbnailFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setLessonThumbnailPreview(url);
    }
  };

  const addLessonResource = () => {
    if (newResource.title.trim() && newResource.url.trim()) {
      setLessonFormData({
        ...lessonFormData,
        resources: [...lessonFormData.resources, { ...newResource }]
      });
      setNewResource({ title: '', url: '', type: 'link' });
    }
  };

  const removeLessonResource = (index) => {
    setLessonFormData({
      ...lessonFormData,
      resources: lessonFormData.resources.filter((_, i) => i !== index)
    });
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    
    if (!lessonFormData.title.trim()) {
      toast.error('Lesson title is required');
      return;
    }

    if (!lessonFormData.duration || lessonFormData.duration < 1) {
      toast.error('Duration must be at least 1 minute');
      return;
    }

    if (!lessonVideoFile) {
      toast.error('Video file is required');
      return;
    }

    setLessonSaving(true);

    try {
      const submitData = new FormData();
      submitData.append('title', lessonFormData.title);
      submitData.append('description', lessonFormData.description);
      submitData.append('duration', lessonFormData.duration);
      submitData.append('notes', lessonFormData.notes);
      submitData.append('resources', JSON.stringify(lessonFormData.resources));

      if (lessonVideoFile) {
        submitData.append('video', lessonVideoFile);
      }

      if (lessonThumbnailFile) {
        submitData.append('thumbnail', lessonThumbnailFile);
      }

      await creatorAPI.createLesson(id, submitData);
      toast.success('Lesson created successfully!');

      // Reset form
      setLessonFormData({
        title: '',
        description: '',
        duration: 5,
        notes: '',
        resources: []
      });
      setLessonVideoFile(null);
      setLessonVideoPreview(null);
      setLessonThumbnailFile(null);
      setLessonThumbnailPreview(null);
      setShowLessonForm(false);
      
      // Refresh lessons
      await fetchLessons();
      
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create lesson';
      toast.error(message);
    } finally {
      setLessonSaving(false);
    }
  };

  const cancelLessonForm = () => {
    setLessonFormData({
      title: '',
      description: '',
      duration: 5,
      notes: '',
      resources: []
    });
    setLessonVideoFile(null);
    setLessonVideoPreview(null);
    setLessonThumbnailFile(null);
    setLessonThumbnailPreview(null);
    setShowLessonForm(false);
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
            onClick={() => navigate('/creator/dashboard')}
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
              onClick={() => navigate('/creator/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Dashboard
            </button>
            
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(course.status)}`}>
                {getStatusIcon(course.status)}
                <span className="ml-1 capitalize">{course.status}</span>
              </span>
              
              {course.status === 'rejected' && course.rejectionReason && (
                <div className="text-sm text-red-600">
                  <strong>Rejection Reason:</strong> {course.rejectionReason}
                </div>
              )}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Course</h1>
          <p className="text-gray-600">{course.title}</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Course Details
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lessons'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lessons ({lessons.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter course title"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                </div>

                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                    Level *
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.level ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select level</option>
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level}</p>}
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description *
                </label>
                <textarea
                  id="shortDescription"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.shortDescription ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Brief description of your course (max 200 characters)"
                  maxLength={200}
                />
                <p className="mt-1 text-sm text-gray-500">{formData.shortDescription.length}/200</p>
                {errors.shortDescription && <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>}
              </div>

              <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Detailed description of your course"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Thumbnail</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Thumbnail
                  </label>
                  <input
                    type="file"
                    id="thumbnail"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-sm text-gray-500">Recommended size: 1280x720px, Max size: 5MB</p>
                </div>

                {thumbnailPreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <div className="relative inline-block">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="h-32 w-56 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnail(null);
                          setThumbnailPreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Tags</h2>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Requirements</h2>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a requirement"
                  />
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {formData.requirements.length > 0 && (
                  <ul className="space-y-2">
                    {formData.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <span className="text-gray-700">{requirement}</span>
                        <button
                          type="button"
                          onClick={() => removeRequirement(requirement)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Learning Outcomes</h2>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newOutcome}
                    onChange={(e) => setNewOutcome(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOutcome())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a learning outcome"
                  />
                  <button
                    type="button"
                    onClick={addOutcome}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {formData.outcomes.length > 0 && (
                  <ul className="space-y-2">
                    {formData.outcomes.map((outcome, index) => (
                      <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <span className="text-gray-700">{outcome}</span>
                        <button
                          type="button"
                          onClick={() => removeOutcome(outcome)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
              
              {course.status === 'draft' && (
                <button
                  onClick={handleSubmitForReview}
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit for Review
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="space-y-6">
            {/* Lesson Creation Form */}
            {showLessonForm && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Create New Lesson</h2>
                  <button
                    onClick={cancelLessonForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleCreateLesson} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="lesson-title" className="block text-sm font-medium text-gray-700 mb-2">
                        Lesson Title *
                      </label>
                      <input
                        type="text"
                        id="lesson-title"
                        name="title"
                        value={lessonFormData.title}
                        onChange={handleLessonChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter lesson title"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="lesson-duration" className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes) *
                      </label>
                      <input
                        type="number"
                        id="lesson-duration"
                        name="duration"
                        value={lessonFormData.duration}
                        onChange={handleLessonChange}
                        min="1"
                        max="300"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter lesson duration in minutes"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="lesson-description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="lesson-description"
                      name="description"
                      value={lessonFormData.description}
                      onChange={handleLessonChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe what students will learn in this lesson"
                    />
                  </div>

                  <div>
                    <label htmlFor="lesson-video" className="block text-sm font-medium text-gray-700 mb-2">
                      Video File *
                    </label>
                    <input
                      type="file"
                      id="lesson-video"
                      accept="video/*"
                      onChange={handleLessonVideoChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">Max size: 500MB</p>
                    
                    {lessonVideoPreview && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                        <video
                          src={lessonVideoPreview}
                          controls
                          className="w-full max-w-md h-48 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lesson-thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
                      Thumbnail Image (Optional)
                    </label>
                    <input
                      type="file"
                      id="lesson-thumbnail"
                      accept="image/*"
                      onChange={handleLessonThumbnailChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    <p className="mt-1 text-sm text-gray-500">Max size: 10MB (JPG, PNG, WebP)</p>
                    
                    {lessonThumbnailPreview && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                        <img
                          src={lessonThumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-full max-w-md h-48 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lesson-notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Instructor Notes
                    </label>
                    <textarea
                      id="lesson-notes"
                      name="notes"
                      value={lessonFormData.notes}
                      onChange={handleLessonChange}
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
                          onClick={addLessonResource}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {lessonFormData.resources.length > 0 && (
                        <div className="space-y-2">
                          {lessonFormData.resources.map((resource, index) => (
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
                                onClick={() => removeLessonResource(index)}
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
                      onClick={cancelLessonForm}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={lessonSaving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {lessonSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Create Lesson
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lessons List */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Lessons ({lessons.length})</h2>
                <button 
                  onClick={() => setShowLessonForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lesson
                </button>
              </div>
              
              {lessons.length === 0 ? (
                <div className="text-center py-12">
                  <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons yet</h3>
                  <p className="text-gray-600 mb-4">Add your first lesson to get started</p>
                  <button 
                    onClick={() => setShowLessonForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center mx-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Lesson
                  </button>
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
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{lesson.title}</h3>
                            <p className="text-sm text-gray-600">{lesson.description}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500">
                                <Clock className="h-4 w-4 inline mr-1" />
                                {lesson.duration} min
                              </span>
                              <span className="text-sm text-gray-500">Order: {lesson.order}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => navigate(`/creator/courses/${id}/lessons`)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title="Manage lesson"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Total Students</p>
                    <p className="text-2xl font-bold text-blue-900">{course.enrollmentCount || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Average Rating</p>
                    <p className="text-2xl font-bold text-green-900">
                      {course.rating?.average?.toFixed(1) || '0.0'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-purple-900">
                      ${((course.enrollmentCount || 0) * course.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center py-8">
              <p className="text-gray-500">Detailed analytics coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditCourse;
