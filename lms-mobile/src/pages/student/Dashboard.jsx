import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStorage } from '../../utils/storage';
import CourseCard from '../../components/course/CourseCard';
import Loader from '../../components/common/Loader';
import { 
  AcademicCapIcon, 
  TrophyIcon, 
  BookOpenIcon, 
  ClockIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = getStorage('token');
      try {
        // Fetch my courses
        const coursesRes = await fetch(`${API_URL}/courses/my-courses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const coursesData = await coursesRes.json();
        setMyCourses(coursesData.data || []);
        
        // Fetch progress for each course
        const progressMap = {};
        for (const course of (coursesData.data || [])) {
          const progressRes = await fetch(`${API_URL}/progress/course/${course.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const progressData = await progressRes.json();
          progressMap[course.id] = progressData.data?.percentage || 0;
        }
        setProgress(progressMap);
        
        // Fetch overall stats
        const statsRes = await fetch(`${API_URL}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const statsData = await statsRes.json();
        setStats(statsData.data);
        
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const avgProgress = myCourses.length > 0 
    ? Math.round(Object.values(progress).reduce((a, b) => a + b, 0) / myCourses.length)
    : 0;
  
  const totalCompletedLessons = myCourses.reduce((total, course) => {
    return total + (progress[course.id] > 0 ? 1 : 0);
  }, 0);

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 rounded-3xl p-8 mb-8">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <SparklesIcon className="w-8 h-8 text-yellow-300" />
            <span className="text-yellow-200 font-medium">Welcome back!</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Hello, {user?.name} 👋
          </h1>
          <p className="text-primary-100 text-lg max-w-md">
            You've enrolled in {myCourses.length} courses. Keep learning!
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center">
            <BookOpenIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{myCourses.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Courses Enrolled</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center">
            <ChartBarIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{avgProgress}%</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Average Progress</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-2xl flex items-center justify-center">
            <ClockIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">0</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Hours Learnt</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-2xl flex items-center justify-center">
            <TrophyIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">0</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Certificates</p>
          </div>
        </div>
      </div>

      {/* Continue Learning Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Continue Learning</h2>
          <Link to="/my-courses" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All →
          </Link>
        </div>
        
        {myCourses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center border border-gray-100 dark:border-gray-700">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpenIcon className="w-10 h-10 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No courses yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Start your learning journey by enrolling in a course.</p>
            <Link to="/courses" className="btn-primary inline-block">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.slice(0, 3).map(course => (
              <CourseCard key={course.id} course={course} progress={progress[course.id] || 0} />
            ))}
          </div>
        )}
      </div>

      {/* Recommended Courses Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Recommended for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCourses.length > 0 ? (
            myCourses.slice(0, 3).map(course => (
              <CourseCard key={course.id} course={course} progress={progress[course.id] || 0} />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              Complete your profile to get personalized recommendations
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;