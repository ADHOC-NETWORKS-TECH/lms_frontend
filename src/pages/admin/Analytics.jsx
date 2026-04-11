import React, { useState, useEffect } from "react";
import { getStorage } from "../../utils/storage";
import Loader from "../../components/common/Loader";
import {
  ChartBarIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "https://lms-backend-g1cy.onrender.com/api";

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = getStorage("token");
      const response = await fetch(`${API_URL}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setAnalytics(data.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  const summary = analytics?.summary || {};
  const monthlyRevenue = analytics?.monthlyRevenue || [];
  const newUsers = analytics?.newUsers || [];
  const popularCourses = analytics?.popularCourses || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="w-8 h-8 text-primary-500" />
            <div>
              <p className="text-2xl font-bold">{summary.totalStudents || 0}</p>
              <p className="text-sm text-gray-500">Total Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <AcademicCapIcon className="w-8 h-8 text-primary-500" />
            <div>
              <p className="text-2xl font-bold">{summary.totalCourses || 0}</p>
              <p className="text-sm text-gray-500">Total Courses</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="w-8 h-8 text-primary-500" />
            <div>
              <p className="text-2xl font-bold">{summary.activeSubscriptions || 0}</p>
              <p className="text-sm text-gray-500">Active Subscriptions</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <CurrencyRupeeIcon className="w-8 h-8 text-primary-500" />
            <div>
              <p className="text-2xl font-bold">₹{summary.totalRevenue || 0}</p>
              <p className="text-sm text-gray-500">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* New Users Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">New Users</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={newUsers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" name="New Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Popular Courses */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Popular Courses</h2>
        <div className="space-y-3">
          {popularCourses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No enrollment data yet</p>
          ) : (
            popularCourses.map((course, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <span className="font-medium">{course.course?.title || `Course ${course.courseId}`}</span>
                <span className="text-primary-600 font-bold">{course.enrollmentCount} enrollments</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;