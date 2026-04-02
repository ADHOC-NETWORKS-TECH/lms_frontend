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
  ChartBarIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const token = getStorage('token');
    try {
      const coursesRes = await fetch(`${API_URL}/courses/my-courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const coursesData = await coursesRes.json();
      setMyCourses(coursesData.data || []);
      
      const progressMap = {};
      for (const course of (coursesData.data || [])) {
        const progressRes = await fetch(`${API_URL}/progress/course/${course.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const progressData = await progressRes.json();
        progressMap[course.id] = progressData.data?.percentage || 0;
      }
      setProgress(progressMap);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const avgProgress = myCourses.length > 0 
    ? Math.round(Object.values(progress).reduce((a, b) => a + b, 0) / myCourses.length)
    : 0;

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 mb-8 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-primary-100 mt-1">Track your learning progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <BookOpenIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{myCourses.length}</p>
              <p className="text-sm text-gray-500">Courses Enrolled</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgProgress}%</p>
              <p className="text-sm text-gray-500">Avg Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-500">Hours Learnt</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrophyIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-500">Certificates</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">My Courses</h2>
          <button onClick={fetchData} className="text-primary-600 text-sm flex items-center gap-1">
            <ArrowPathIcon className="w-4 h-4" /> Refresh
          </button>
        </div>
        
        {myCourses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
            <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
            <Link to="/courses" className="btn-primary inline-block">Browse Courses</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map(course => (
              <CourseCard key={course.id} course={course} progress={progress[course.id] || 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;