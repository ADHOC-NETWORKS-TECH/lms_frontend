import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import CourseCard from '../../components/course/CourseCard';
import Loader from '../../components/common/Loader';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await api.get('/courses');
      setCourses(data.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 animate-fade-in">
          Learn Anytime, Anywhere
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Access premium courses and earn certificates
        </p>
      </div>
      
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No courses available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;