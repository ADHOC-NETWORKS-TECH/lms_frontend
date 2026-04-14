import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HomeIcon, 
  BookOpenIcon, 
  UserIcon, 
  Cog6ToothIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  TrophyIcon, // ← ADD THIS
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  UserIcon as UserIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  TrophyIcon as TrophyIconSolid,  // ← ADD THIS
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid
} from '@heroicons/react/24/solid';

const BottomNav = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) return null;

  const navItems = [
    { path: '/', icon: HomeIcon, activeIcon: HomeIconSolid, label: 'Home' },
    { path: '/dashboard', icon: ChartBarIcon, activeIcon: ChartBarIconSolid, label: 'Dashboard' },
    { path: '/my-courses', icon: BookOpenIcon, activeIcon: BookOpenIconSolid, label: 'Courses' },
    { path: '/profile', icon: UserIcon, activeIcon: UserIconSolid, label: 'Profile' },
    { path: '/my-doubts', icon: ChatBubbleLeftRightIcon, activeIcon: ChatBubbleLeftRightIconSolid, label: 'Doubts' },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin', icon: ShieldCheckIcon, activeIcon: ShieldCheckIconSolid, label: 'Admin' });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400 hover:text-primary-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <item.activeIcon className="w-5 h-5" />
                ) : (
                  <item.icon className="w-5 h-5" />
                )}
                <span className="text-xs mt-1">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;