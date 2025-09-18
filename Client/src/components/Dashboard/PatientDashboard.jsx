import React from 'react';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  HeartIcon, 
  CheckCircleIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  DocumentTextIcon,
  BellIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const PatientDashboard = () => {
  const upcomingAppointments = [
    {
      id: 1,
      treatment: 'Abhyanga Massage',
      doctor: 'Dr. Priya Sharma',
      date: '2024-01-15',
      time: '10:00 AM',
      status: 'confirmed'
    },
    {
      id: 2,
      treatment: 'Shirodhara',
      doctor: 'Dr. Rajesh Kumar',
      date: '2024-01-17',
      time: '2:30 PM',
      status: 'pending'
    }
  ];

  const recentTreatments = [
    {
      id: 1,
      treatment: 'Panchakarma Detox',
      date: '2024-01-10',
      doctor: 'Dr. Priya Sharma',
      notes: 'Excellent progress, continue with current plan',
      status: 'completed'
    },
    {
      id: 2,
      treatment: 'Nasya Therapy',
      date: '2024-01-08',
      doctor: 'Dr. Rajesh Kumar',
      notes: 'Patient responded well to treatment',
      status: 'completed'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, Rahul!</h1>
        <p className="text-gray-600">Your wellness journey continues. Here's your treatment overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Treatment Progress</p>
              <p className="text-2xl font-bold text-green-600">8/21</p>
              <p className="text-xs text-gray-500">Sessions completed</p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '38%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Next Appointment</p>
              <p className="text-2xl font-bold text-blue-600">Jan 15</p>
              <p className="text-xs text-gray-500">10:00 AM</p>
            </div>
            <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dosha Balance</p>
              <p className="text-2xl font-bold text-orange-600">Vata</p>
              <p className="text-xs text-gray-500">Primary constitution</p>
            </div>
            <SparklesIcon className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Wellness Score</p>
              <p className="text-2xl font-bold text-purple-600">85%</p>
              <p className="text-xs text-gray-500">Improving</p>
            </div>
            <HeartIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <CalendarDaysIcon className="h-5 w-5 mr-2 text-blue-600" />
              Upcoming Appointments
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{appointment.treatment}</p>
                      <p className="text-sm text-gray-600">{appointment.doctor}</p>
                      <p className="text-sm text-gray-500">{appointment.date} at {appointment.time}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Treatments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-green-600" />
              Recent Treatments
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentTreatments.map((treatment) => (
                <div key={treatment.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-800">{treatment.treatment}</h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {treatment.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{treatment.doctor}</p>
                  <p className="text-sm text-gray-500 mb-2">{treatment.date}</p>
                  <p className="text-sm text-gray-700 italic">"{treatment.notes}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dosha Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2 text-orange-600" />
            Current Dosha Balance
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <SparklesIcon className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Vata</h3>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <p className="text-sm text-gray-600">65% - Elevated</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <SparklesIcon className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Pitta</h3>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
              <p className="text-sm text-gray-600">25% - Balanced</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <SparklesIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Kapha</h3>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
              <p className="text-sm text-gray-600">10% - Low</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <CalendarDaysIcon className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-700 font-medium">Book Appointment</span>
            </button>
            <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <DocumentTextIcon className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-700 font-medium">View Reports</span>
            </button>
            <button className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <BellIcon className="h-5 w-5 text-orange-600 mr-2" />
              <span className="text-orange-700 font-medium">Notifications</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;