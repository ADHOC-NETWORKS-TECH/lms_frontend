import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const CourseCard = ({ course, progress }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (course.userAccess?.hasAccess) {
      navigate(`/course/${course.id}/play`);
    } else {
      navigate(`/course/${course.id}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={handleClick}>
      <div className="relative">
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop'}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {course.userAccess?.hasAccess ? (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
            Access Granted
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
            ₹{course.prices?.['3months'] || 1999}
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">
          {course.title}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {course.description || 'Learn valuable skills and advance your career with this comprehensive course.'}
        </p>
        
        {course.userAccess?.hasAccess ? (
          <div className="space-y-3">
            {progress > 0 && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <ClockIcon className="w-3 h-3" />
                <span>{course.userAccess.daysRemaining || 30} days left</span>
              </div>
              <button className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                <PlayCircleIcon className="w-4 h-4" /> Continue
              </button>
            </div>
          </div>
        ) : (
          <button className="w-full bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 py-2 rounded-xl font-medium hover:from-primary-50 hover:to-primary-100 hover:text-primary-700 transition-all duration-200 border border-gray-200">
            View Details
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;