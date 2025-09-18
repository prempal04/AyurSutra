import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-emerald-600">AyurSutra</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user?.avatar ? (
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={user.avatar}
                  alt={user.fullName || `${user.firstName} ${user.lastName}` || 'User'}
                />
              ) : (
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
              )}
              <div className="hidden md:block">
                <div className="text-base font-medium text-gray-700">
                  {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
                </div>
                <div className="text-sm text-gray-500 capitalize">
                  {user?.role || 'Unknown'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
