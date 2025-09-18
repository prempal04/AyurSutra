import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Header({ userRole }) {
  const navigate = useNavigate();
  const user = userRole === 'admin' ? {
    name: 'Dr. Ayurveda Kumar',
    role: 'admin',
    avatar: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
  } : {
    name: 'Rahul Sharma',
    role: 'patient',
    avatar: 'https://images.pexels.com/photos/8852564/pexels-photo-8852564.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
  };
  const handleLogout = () => {
    navigate('/login');
  };
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-emerald-600">PanchkarmaPlus</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user?.avatar ? (
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={user.avatar}
                  alt={user.name}
                />
              ) : (
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
              )}
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
