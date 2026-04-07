import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import CourseCard from '../../components/course/CourseCard';
import Loader from '../../components/common/Loader';
import { 
  AcademicCapIcon, 
  SparklesIcon, 
  ArrowPathIcon,
  BookOpenIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

 const fetchCourses = async () => {
  setLoading(true);
  try {
    const data = await api.get('/courses');

    console.log("All Courses:", data.data); // 👈 ADD THIS

    setCourses(data.data || []);

    if (isAuthenticated) {
      const myCoursesData = await api.get('/courses/my-courses', true);
      setMyCourses(myCoursesData.data || []);
    }

  } catch (error) {
    console.error('Error fetching courses:', error);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  fetchCourses();
}, [isAuthenticated, user]); 

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20 md:pb-8">
      
      {/* Hero Section - Different for Logged-in Users */}
      {isAuthenticated ? (
        // Logged-in User Hero Section
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-8 mb-12">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <SparklesIcon className="w-8 h-8 text-yellow-300" />
              <span className="text-yellow-200 font-medium">Welcome back, {user?.name}!</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Continue Learning?
            </h1>
            <p className="text-primary-100 text-lg max-w-2xl mb-6">
              You've enrolled in {myCourses.length} courses. Keep up the great momentum!
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/dashboard" className="bg-white text-primary-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5" />
                Go to Dashboard
              </Link>
              <Link to="/my-courses" className="bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5" />
                My Courses
              </Link>
            </div>
          </div>
        </div>
      ) : (
        // Guest User Hero Section
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-10 mb-12 text-center">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <AcademicCapIcon className="w-16 h-16 text-white/80" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Start Your Learning Journey
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Access 1000+ premium courses taught by industry experts
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Link to="/courses" className="bg-white text-primary-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition">
                Explore Courses
              </Link>
              <Link to="/register" className="bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Featured Courses Section - Same for both */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {isAuthenticated ? 'Recommended for You' : 'Featured Courses'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {isAuthenticated 
                ? 'Based on your learning interests' 
                : 'Most popular courses this month'}
            </p>
          </div>
          <button onClick={fetchCourses} className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1">
            <ArrowPathIcon className="w-4 h-4" /> Refresh
          </button>
        </div>
        
        {courses.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow">
            <p className="text-gray-500 dark:text-gray-400">No courses available yet. Check back soon!</p>
          </div>
        ) : (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {courses.slice(0, 6).map(course => (
    <CourseCard key={course.id} course={course} />
  ))}
</div>
        )}
      </div>

      {/* Stats Section - Only for Logged-in Users */}
      {isAuthenticated && myCourses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">Your Learning Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <BookOpenIcon className="w-10 h-10 text-primary-600 mx-auto mb-3" />
              <p className="text-2xl font-bold">{myCourses.length}</p>
              <p className="text-sm text-gray-500">Courses Enrolled</p>
            </div>
            <div className="text-center">
              <UserGroupIcon className="w-10 h-10 text-primary-600 mx-auto mb-3" />
              <p className="text-2xl font-bold">In Progress</p>
              <p className="text-sm text-gray-500">Keep Learning</p>
            </div>
            <div className="text-center">
              <AcademicCapIcon className="w-10 h-10 text-primary-600 mx-auto mb-3" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-500">Certificates Earned</p>
            </div>
          </div>
        </div>
      )}

      {/* Why Choose Us Section - Only for Guest Users */}
      {!isAuthenticated && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Why Choose LMS Portal?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <SparklesIcon className="w-10 h-10 text-primary-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Expert Instructors</h3>
              <p className="text-sm text-gray-500">Learn from industry professionals</p>
            </div>
            <div>
              <AcademicCapIcon className="w-10 h-10 text-primary-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Certified Courses</h3>
              <p className="text-sm text-gray-500">Earn certificates upon completion</p>
            </div>
            <div>
              <SparklesIcon className="w-10 h-10 text-primary-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Learn Anywhere</h3>
              <p className="text-sm text-gray-500">Mobile-friendly platform</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;