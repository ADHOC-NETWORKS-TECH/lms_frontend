import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  UserGroupIcon, 
  CalendarIcon,
  ArrowRightOnRectangleIcon,
  TrophyIcon,
  Cog6ToothIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-20 md:pb-8">
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

      {/* Profile Information Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 mb-6">
        <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-4">
          <h2 className="font-semibold text-gray-800 dark:text-white">Profile Information</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          <div className="flex items-center gap-4 p-5">
            <UserCircleIcon className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Full Name</p>
              <p className="text-gray-800 dark:text-white font-medium mt-1">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5">
            <EnvelopeIcon className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Email Address</p>
              <p className="text-gray-800 dark:text-white font-medium mt-1">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5">
            <UserGroupIcon className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Account Type</p>
              <p className="text-gray-800 dark:text-white font-medium mt-1 capitalize">{user?.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Member Since</p>
              <p className="text-gray-800 dark:text-white font-medium mt-1">2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Certificates & Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 mb-6">
        <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-4">
          <h2 className="font-semibold text-gray-800 dark:text-white">Quick Actions</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {/* Certificates Link */}
          <Link 
            to="/certificates" 
            className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <TrophyIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">My Certificates</p>
                <p className="text-xs text-gray-500">View and download your earned certificates</p>
              </div>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
          </Link>

          {/* Settings Link */}
          <Link 
            to="/settings" 
            className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <Cog6ToothIcon className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Settings</p>
                <p className="text-xs text-gray-500">Dark mode, notifications, and preferences</p>
              </div>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
          </Link>
        </div>
      </div>

      {/* Logout Button */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-5">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-3 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
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