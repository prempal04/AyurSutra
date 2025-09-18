import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  userRole: 'admin' | 'patient';
  children?: React.ReactNode;
}

export default function Layout({ userRole, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header userRole={userRole} />
      <div className="flex">
        <Sidebar userRole={userRole} />
        <main className="flex-1 md:pl-64">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children || <Outlet />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}