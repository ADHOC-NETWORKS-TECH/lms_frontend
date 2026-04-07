import React, { useState, useEffect } from 'react';
import { getStorage } from '../../utils/storage';
import Loader from '../../components/common/Loader';
import { ChartBarIcon, UserGroupIcon, CurrencyRupeeIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL;

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = getStorage('token');
      const response = await fetch(`${API_URL}/admin/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAnalytics(data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="w-8 h-8 text-primary-500" />
            <div>
              <p className="text-2xl font-bold">{analytics?.completionRate || 0}%</p>
              <p className="text-sm text-gray-500">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Monthly Revenue Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>
        <div className="space-y-2">
          {analytics?.monthlyRevenue?.map(item => (
            <div key={item.month}>
              <div className="flex justify-between text-sm mb-1">
                <span>{item.month}</span>
                <span>₹{item.revenue}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-primary-600 h-4 rounded-full"
                  style={{ width: `${Math.min((item.revenue / 10000) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Popular Courses */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Popular Courses</h2>
        <div className="space-y-3">
          {analytics?.popularCourses?.map(course => (
            <div key={course.courseId} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="font-medium">{course.course?.title}</span>
              <span className="text-primary-600 font-bold">{course.enrollmentCount} enrollments</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;