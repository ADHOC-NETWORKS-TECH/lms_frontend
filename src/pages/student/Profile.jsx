import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  UserGroupIcon, 
  CalendarIcon,
  AcademicCapIcon,
  TrophyIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, logout } = useAuth();

  const stats = [
    { label: 'Courses Enrolled', value: '0', icon: AcademicCapIcon, color: 'bg-blue-100 text-blue-600' },
    { label: 'Certificates', value: '0', icon: TrophyIcon, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Hours Learned', value: '0', icon: ClockIcon, color: 'bg-green-100 text-green-600' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Profile Header */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl transform -rotate-1 scale-105"></div>
        <div className="relative bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-4xl font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold">{user?.name}</h1>
              <p className="text-primary-100 mt-1">{user?.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-medium">
                {user?.role === 'admin' ? 'Administrator' : 'Student Member'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-5 flex items-center gap-4 border border-gray-100">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <h2 className="font-semibold text-gray-800">Profile Information</h2>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="flex items-center gap-4 p-6">
            <UserCircleIcon className="w-6 h-6 text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Full Name</p>
              <p className="text-gray-800 font-medium mt-1">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6">
            <EnvelopeIcon className="w-6 h-6 text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Email Address</p>
              <p className="text-gray-800 font-medium mt-1">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6">
            <UserGroupIcon className="w-6 h-6 text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Account Type</p>
              <p className="text-gray-800 font-medium mt-1 capitalize">{user?.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6">
            <CalendarIcon className="w-6 h-6 text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Member Since</p>
              <p className="text-gray-800 font-medium mt-1">2024</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-xl font-medium hover:bg-red-100 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;