import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserGroupIcon, 
  CalendarDaysIcon, 
  HeartIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { dashboardAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import AddPatientModal from './AddPatientModal';
import ScheduleAppointmentModal from './ScheduleAppointmentModal';
import CreateTreatmentPlanModal from './CreateTreatmentPlanModal';
import ViewReportsModal from './ViewReportsModal';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentAppointments: [],
    treatmentStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [modals, setModals] = useState({
    addPatient: false,
    scheduleAppointment: false,
    createTreatmentPlan: false,
    viewReports: false
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('AdminDashboard: Fetching dashboard data...');
      
      const response = await dashboardAPI.getDashboard();
      console.log('AdminDashboard: Dashboard data received:', response);
      
      if (response && response.data) {
        const { overview, todaysAppointments, topTreatments } = response.data;
        console.log('AdminDashboard: topTreatments received:', topTreatments);
        
        // Format stats for display
        const formattedStats = [
          {
            name: 'Total Patients',
            value: overview?.totalPatients?.toString() || '0',
            icon: UserGroupIcon,
            color: 'bg-blue-500',
            change: '+18%', // Could be calculated from historical data
            changeType: 'positive'
          },
          {
            name: 'Today\'s Appointments',
            value: todaysAppointments?.length?.toString() || '0',
            icon: CalendarDaysIcon,
            color: 'bg-emerald-500',
            change: `+${todaysAppointments?.length || 0}`,
            changeType: 'positive'
          },
          {
            name: 'Active Treatments',
            value: overview?.totalAppointments?.toString() || '0',
            icon: HeartIcon,
            color: 'bg-orange-500',
            change: '+12%',
            changeType: 'positive'
          },
          {
            name: 'This Month Revenue',
            value: `₹${overview?.monthlyRevenue?.toLocaleString() || '0'}`,
            icon: ChartBarIcon,
            color: 'bg-purple-500',
            change: '+25%',
            changeType: 'positive'
          },
        ];

        // Format treatment stats
        const formattedTreatmentStats = topTreatments?.map((item, index) => ({
          name: item.treatment?.name || 'Unknown Treatment',
          count: item.count || 0,
          color: [
            'bg-emerald-100 text-emerald-800',
            'bg-blue-100 text-blue-800', 
            'bg-purple-100 text-purple-800',
            'bg-orange-100 text-orange-800'
          ][index % 4]
        })) || [];

        console.log('AdminDashboard: formattedTreatmentStats:', formattedTreatmentStats);

        setDashboardData({
          stats: formattedStats,
          recentAppointments: todaysAppointments || [],
          treatmentStats: formattedTreatmentStats
        });
      }
    } catch (error) {
      console.error('AdminDashboard: Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      
      // Fallback to default stats if API fails
      setDashboardData({
        stats: [
          {
            name: 'Total Patients',
            value: '-',
            icon: UserGroupIcon,
            color: 'bg-blue-500',
            change: '-',
            changeType: 'positive'
          },
          {
            name: 'Today\'s Appointments',
            value: '-',
            icon: CalendarDaysIcon,
            color: 'bg-emerald-500',
            change: '-',
            changeType: 'positive'
          },
          {
            name: 'Active Treatments',
            value: '-',
            icon: HeartIcon,
            color: 'bg-orange-500',
            change: '-',
            changeType: 'positive'
          },
          {
            name: 'This Month Revenue',
            value: '-',
            icon: ChartBarIcon,
            color: 'bg-purple-500',
            change: '-',
            changeType: 'positive'
          },
        ],
        recentAppointments: [],
        treatmentStats: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const openModal = (modalName) => {
    console.log('AdminDashboard: Opening modal:', modalName);
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    console.log('AdminDashboard: Closing modal:', modalName);
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const handleModalSuccess = (modalName, data) => {
    console.log(`AdminDashboard: ${modalName} success:`, data);
    closeModal(modalName);
    // Refresh dashboard data
    fetchDashboardData();
    
    // Show success message (you can implement a toast notification here)
    const actions = {
      addPatient: 'Patient created successfully!',
      scheduleAppointment: 'Appointment scheduled successfully!',
      createTreatmentPlan: 'Treatment plan created successfully!',
      viewReports: 'Report generated successfully!'
    };
    
    // For now, just log the success message
    console.log(actions[modalName]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back, {user?.fullName || `${user?.firstName} ${user?.lastName}` || 'Admin'}! Here's what's happening in your Ayurvedic clinic today.
        </p>
        {error && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-600 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {dashboardData.stats.map((stat) => (
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
            {dashboardData.recentAppointments.length > 0 ? (
              dashboardData.recentAppointments.map((appointment) => (
                <div key={appointment._id || appointment.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <UserGroupIcon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.patient?.user?.fullName || 
                           `${appointment.patient?.user?.firstName || ''} ${appointment.patient?.user?.lastName || ''}`.trim() ||
                           'Unknown Patient'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.treatment?.name || 'No treatment specified'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">
                        {appointment.timeSlot?.start || 'TBD'}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No appointments scheduled for today</p>
              </div>
            )}
          </div>
          <div className="px-6 py-3 border-t border-gray-200">
            <Link
              to="/appointments"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
            >
              View all appointments →
            </Link>
          </div>
        </div>

        {/* Treatment Statistics */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Active Treatments</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboardData.treatmentStats.length > 0 ? (
                dashboardData.treatmentStats.map((treatment, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{treatment.name}</p>
                      <p className="text-sm text-gray-500">Active sessions</p>
                    </div>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${treatment.color}`}>
                      {treatment.count}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <HeartIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No active treatments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <button 
          onClick={() => {
            console.log('Quick Action: Add New Patient clicked');
            openModal('addPatient');
          }}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 hover:shadow-md transition-all duration-200"
        >
          <div className="text-center">
            <UserGroupIcon className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Add New Patient</p>
          </div>
        </button>
        
        <button 
          onClick={() => {
            console.log('Quick Action: Schedule Appointment clicked');
            openModal('scheduleAppointment');
          }}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
        >
          <div className="text-center">
            <CalendarDaysIcon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Schedule Appointment</p>
          </div>
        </button>
        
        <button 
          onClick={() => {
            console.log('Quick Action: Create Treatment Plan clicked');
            openModal('createTreatmentPlan');
          }}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all duration-200"
        >
          <div className="text-center">
            <HeartIcon className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Create Treatment Plan</p>
          </div>
        </button>
        
        <button 
          onClick={() => {
            console.log('Quick Action: View Reports clicked');
            openModal('viewReports');
          }}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all duration-200"
        >
          <div className="text-center">
            <ChartBarIcon className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">View Reports</p>
          </div>
        </button>
      </div>

      {/* Modals */}
      <AddPatientModal
        isOpen={modals.addPatient}
        onClose={() => closeModal('addPatient')}
        onSuccess={(data) => handleModalSuccess('addPatient', data)}
      />
      
      <ScheduleAppointmentModal
        isOpen={modals.scheduleAppointment}
        onClose={() => closeModal('scheduleAppointment')}
        onSuccess={(data) => handleModalSuccess('scheduleAppointment', data)}
      />
      
      <CreateTreatmentPlanModal
        isOpen={modals.createTreatmentPlan}
        onClose={() => closeModal('createTreatmentPlan')}
        onSuccess={(data) => handleModalSuccess('createTreatmentPlan', data)}
      />
      
      <ViewReportsModal
        isOpen={modals.viewReports}
        onClose={() => closeModal('viewReports')}
      />
    </div>
  );
}