import React from 'react';
import { 
  UserGroupIcon, 
  CalendarDaysIcon, 
  HeartIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const stats = [
  {
    name: 'Total Patients',
    value: '247',
    icon: UserGroupIcon,
    color: 'bg-blue-500',
    change: '+18%',
    changeType: 'positive'
  },
  {
    name: 'Today\'s Appointments',
    value: '12',
    icon: CalendarDaysIcon,
    color: 'bg-emerald-500',
    change: '+4',
    changeType: 'positive'
  },
  {
    name: 'Active Treatments',
    value: '89',
    icon: HeartIcon,
    color: 'bg-orange-500',
    change: '+12%',
    changeType: 'positive'
  },
  {
    name: 'This Month Revenue',
    value: '₹3,45,000',
    icon: ChartBarIcon,
    color: 'bg-purple-500',
    change: '+25%',
    changeType: 'positive'
  },
];

const recentAppointments = [
  {
    id: '1',
    patient: 'Rahul Sharma',
    treatment: 'Panchakarma Detox Program',
    time: '10:00 AM',
    status: 'scheduled',
    avatar: 'https://images.pexels.com/photos/8852564/pexels-photo-8852564.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2'
  },
  {
    id: '2',
    patient: 'Priya Patel',
    treatment: 'Shirodhara + Abhyanga',
    time: '11:30 AM',
    status: 'in-progress',
    avatar: 'https://images.pexels.com/photos/8853502/pexels-photo-8853502.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2'
  },
  {
    id: '3',
    patient: 'Anita Desai',
    treatment: 'Nasya + Karna Purana',
    time: '2:00 PM',
    status: 'scheduled',
    avatar: 'https://images.pexels.com/photos/8853501/pexels-photo-8853501.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2'
  },
  {
    id: '4',
    patient: 'Vikram Singh',
    treatment: 'Basti Therapy',
    time: '3:30 PM',
    status: 'completed',
    avatar: 'https://images.pexels.com/photos/8853499/pexels-photo-8853499.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2'
  },
  {
    id: '5',
    patient: 'Meera Joshi',
    treatment: 'Udvartana + Steam Bath',
    time: '4:00 PM',
    status: 'scheduled',
    avatar: 'https://images.pexels.com/photos/8853500/pexels-photo-8853500.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2'
  },
];

const treatmentStats = [
  { name: 'Panchakarma Programs', count: 45, color: 'bg-emerald-100 text-emerald-800' },
  { name: 'Abhyanga Sessions', count: 78, color: 'bg-blue-100 text-blue-800' },
  { name: 'Shirodhara Treatments', count: 32, color: 'bg-purple-100 text-purple-800' },
  { name: 'Basti Therapies', count: 23, color: 'bg-orange-100 text-orange-800' },
];

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back, Dr. Kumar! Here's what's happening in your Panchkarma clinic today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} p-3 rounded-md`}>
                    <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Appointments */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Today's Appointments</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentAppointments.map((appointment) => (
              <div key={appointment.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <img
                      className="h-10 w-10 rounded-full object-cover mr-3"
                      src={appointment.avatar}
                      alt={appointment.patient}
                    />
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.patient}
                    </p>
                    <p className="text-sm text-gray-500">{appointment.treatment}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">{appointment.time}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-gray-200">
            <a
              href="/appointments"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
            >
              View all appointments →
            </a>
          </div>
        </div>

        {/* Treatment Statistics */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Active Treatments</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {treatmentStats.map((treatment, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{treatment.name}</p>
                    <p className="text-sm text-gray-500">Active sessions</p>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${treatment.color}`}>
                    {treatment.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <button className="p-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 hover:shadow-md transition-all duration-200">
          <div className="text-center">
            <UserGroupIcon className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Add New Patient</p>
          </div>
        </button>
        
        <button className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200">
          <div className="text-center">
            <CalendarDaysIcon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Schedule Appointment</p>
          </div>
        </button>
        
        <button className="p-4 bg-white border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all duration-200">
          <div className="text-center">
            <HeartIcon className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Create Treatment Plan</p>
          </div>
        </button>
        
        <button className="p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all duration-200">
          <div className="text-center">
            <ChartBarIcon className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">View Reports</p>
          </div>
        </button>
      </div>
    </div>
  );
}