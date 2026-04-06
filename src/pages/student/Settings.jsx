import React from 'react';
import { useTheme } from '../../App';
import { SunIcon, MoonIcon, BellIcon, WifiIcon } from '@heroicons/react/24/outline';

const Settings = () => {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Customize your learning experience</p>
      </div>

      <div className="space-y-6">
        {/* Dark Mode Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
            <h2 className="font-semibold text-gray-800 dark:text-white">Appearance</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                  {darkMode ? (
                    <MoonIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <SunIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Dark Mode</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark theme</p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary-600' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
            <h2 className="font-semibold text-gray-800 dark:text-white">Notifications</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                  <BellIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Push Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates about your courses</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full">
                <div className="w-5 h-5 bg-white rounded-full translate-x-1" />
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
            <h2 className="font-semibold text-gray-800 dark:text-white">About</h2>
          </div>
          <div className="p-5">
            <p className="text-gray-600 dark:text-gray-300">LMS Portal v1.0.0</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Learn anytime, anywhere</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;