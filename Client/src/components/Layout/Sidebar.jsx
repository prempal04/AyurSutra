import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  HeartIcon,
  BookOpenIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const adminNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Patients', href: '/patients', icon: UserGroupIcon },
  { name: 'Appointments', href: '/appointments', icon: CalendarDaysIcon },
  { name: 'Treatments', href: '/treatments', icon: HeartIcon },
  { name: 'Treatment Plans', href: '/treatment-plans', icon: ClipboardDocumentListIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

const patientNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'My Appointments', href: '/my-appointments', icon: CalendarDaysIcon },
  { name: 'Treatment Plan', href: '/my-treatment-plan', icon: ClipboardDocumentListIcon },
  { name: 'Health Records', href: '/health-records', icon: BookOpenIcon },
  { name: 'Book Appointment', href: '/book-appointment', icon: CalendarDaysIcon },
];

export default function Sidebar({ userRole }) {
  const navItems = userRole === 'admin' ? adminNavItems : patientNavItems;
  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 pt-16">
      <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon
                  className="mr-3 flex-shrink-0 h-6 w-6"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
