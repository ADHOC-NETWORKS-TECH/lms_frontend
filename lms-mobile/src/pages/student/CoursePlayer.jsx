import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStorage } from '../../utils/storage';
import VideoPlayer from '../../components/course/VideoPlayer';
import Loader from '../../components/common/Loader';
import { ChevronDownIcon, ChevronUpIcon, PlayCircleIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const API_URL = 'http://localhost:5000/api';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [expandedModules, setExpandedModules] = useState([]);
  const [courseProgress, setCourseProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getStorage('token');
        
        // Fetch course details
        const courseRes = await fetch(`${API_URL}/courses/${courseId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const courseData = await courseRes.json();
        
        if (!courseData.data.userAccess?.hasAccess) {
          navigate(`/course/${courseId}`);
          return;
        }
        
        setCourse(courseData.data);
        
        // Fetch progress
        const progressRes = await fetch(`${API_URL}/progress/course/${courseId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const progressData = await progressRes.json();
        setCourseProgress(progressData.data);
        
        // Mark completed lessons
        const completedMap = {};
        progressData.data?.lessons?.forEach(l => {
          if (l.completed) completedMap[l.id] = true;
        });
        
        const modulesWithProgress = (courseData.data.modules || []).map(module => ({
          ...module,
          lessons: module.lessons.map(lesson => ({
            ...lesson,
            completed: completedMap[lesson.id] || false
          }))
        }));
        
        setModules(modulesWithProgress);
        setExpandedModules([modulesWithProgress[0]?.id]);
        
        // Set first incomplete lesson
        let firstIncomplete = null;
        for (const module of modulesWithProgress) {
          for (const lesson of module.lessons) {
            if (!lesson.completed) {
              firstIncomplete = lesson;
              break;
            }
          }
          if (firstIncomplete) break;
        }
        setCurrentLesson(firstIncomplete || modulesWithProgress[0]?.lessons[0]);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, navigate]);

  const markComplete = async () => {
    if (!currentLesson) return;
    
    const token = getStorage('token');
    await fetch(`${API_URL}/progress/lesson/${currentLesson.id}/complete`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Update local state
    setModules(prev =>
      prev.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson =>
          lesson.id === currentLesson.id ? { ...lesson, completed: true } : lesson
        )
      }))
    );
    
    // Update progress
    const progressRes = await fetch(`${API_URL}/progress/course/${courseId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const progressData = await progressRes.json();
    setCourseProgress(progressData.data);
    
    // Find next lesson
    let nextLesson = null;
    let foundCurrent = false;
    for (const module of modules) {
      for (const lesson of module.lessons) {
        if (foundCurrent && !lesson.completed && lesson.id !== currentLesson.id) {
          nextLesson = lesson;
          break;
        }
        if (lesson.id === currentLesson.id) foundCurrent = true;
      }
      if (nextLesson) break;
    }
    
    if (nextLesson) {
      setCurrentLesson(nextLesson);
    } else {
      alert('🎉 Congratulations! You completed all lessons!');
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev =>
      prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
    );
  };

  if (loading) return <Loader />;

  if (!course || !course.userAccess?.hasAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-600 mb-4">You don't have access to this course.</p>
        <a href="/courses" className="btn-primary inline-block">Browse Courses</a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Course Header with Progress */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{course.title}</h1>
        {courseProgress && (
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Course Progress</span>
              <span>{courseProgress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${courseProgress.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {courseProgress.completedLessons} of {courseProgress.totalLessons} lessons completed
            </p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Modules */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden sticky top-20">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h2 className="font-semibold text-gray-800 dark:text-white">Course Content</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {modules.map(module => (
                <div key={module.id}>
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex justify-between items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <div className="flex items-center gap-2">
                      <FolderIcon className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-sm text-gray-800 dark:text-white">{module.title}</span>
                    </div>
                    {expandedModules.includes(module.id) ? (
                      <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedModules.includes(module.id) && (
                    <div className="bg-gray-50 dark:bg-gray-900/50">
                      {module.lessons.map(lesson => (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLesson(lesson)}
                          className={`w-full flex justify-between items-center p-3 pl-8 hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                            currentLesson?.id === lesson.id ? 'bg-primary-50 dark:bg-primary-900/30' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {lesson.completed ? (
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            ) : (
                              <PlayCircleIcon className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="text-sm text-gray-700 dark:text-gray-300">{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{lesson.duration} min</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main - Video Player */}
        <div className="lg:col-span-2">
          {currentLesson ? (
            <VideoPlayer
              videoUrl={currentLesson.videoUrl}
              title={currentLesson.title}
              onComplete={markComplete}
              autoPlay
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
              <PlayCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a lesson to start learning</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Import missing icon
import { FolderIcon } from '@heroicons/react/24/outline';

export default CoursePlayer;