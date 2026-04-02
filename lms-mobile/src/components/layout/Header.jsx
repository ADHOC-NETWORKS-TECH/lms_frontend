import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bars3Icon, XMarkIcon, UserCircleIcon, BookOpenIcon, HomeIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
              <AcademicCapIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                LMS Portal
              </span>
              <span className="text-xs text-gray-400 block -mt-1">Learn Anytime</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className="px-4 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200 flex items-center gap-2">
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link to="/courses" className="px-4 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200 flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5" />
              <span>Courses</span>
            </Link>
            
            {isAuthenticated && (
              <>
                <Link to="/my-courses" className="px-4 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200">
                  My Courses
                </Link>
                <Link to="/profile" className="px-4 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all duration-200">
                  Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="px-4 py-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all duration-200">
                    Admin
                  </Link>
                )}
                <div className="ml-4 flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}

            {!isAuthenticated && (
              <div className="flex items-center gap-3 ml-4">
                <Link to="/login" className="px-5 py-2 text-gray-700 hover:text-primary-600 transition-all duration-200 font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2 rounded-xl font-medium shadow-md hover:shadow-lg transition-all">
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {menuOpen ? <XMarkIcon className="w-6 h-6 text-gray-600" /> : <Bars3Icon className="w-6 h-6 text-gray-600" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 bg-white">
            <div className="flex flex-col space-y-2">
              <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <HomeIcon className="w-5 h-5" />
                <span>Home</span>
              </Link>
              <Link to="/courses" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <BookOpenIcon className="w-5 h-5" />
                <span>Courses</span>
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/my-courses" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <BookOpenIcon className="w-5 h-5" />
                    <span>My Courses</span>
                  </Link>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <UserCircleIcon className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                      <AcademicCapIcon className="w-5 h-5" />
                      <span>Admin</span>
                    </Link>
                  )}
                  <div className="border-t border-gray-100 my-2 pt-2">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
                      Logout
                    </button>
                  </div>
                </>
              )}
              {!isAuthenticated && (
                <div className="flex flex-col gap-2 pt-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="text-center px-4 py-3 text-primary-600 font-medium">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="text-center bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-medium">
                    Sign Up Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;