import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import CourseCard from '../../components/course/CourseCard';
import Loader from '../../components/common/Loader';
import { BookOpenIcon } from '@heroicons/react/24/outline';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const coursesRes = await api.get('/courses/my-courses', true);
      const progressRes = await api.get('/progress/overall', true);
      
      setCourses(coursesRes.data || []);
      
      const progressMap = {};
      (progressRes.data || []).forEach(p => {
        progressMap[p.id] = p.progress;
      });
      setProgress(progressMap);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">My Courses</h1>
      
      {courses.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpenIcon className="w-10 h-10 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No courses yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't enrolled in any courses.</p>
          <button onClick={() => navigate('/courses')} className="btn-primary inline-block">
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} progress={progress[course.id] || 0} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;