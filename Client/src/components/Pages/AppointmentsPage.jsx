import React, { useState, useEffect } from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import PageHeader from '../Shared/PageHeader';
import Table from '../Shared/Table';
import { appointmentsAPI } from '../../services/api';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };
      
      console.log('AppointmentsPage: Fetching appointments with params:', params);
      
      const response = await appointmentsAPI.getAppointments(params);
      console.log('AppointmentsPage: API response:', response);
      
      if (response && response.data) {
        const { appointments: appointmentData, pagination } = response.data;
        console.log('AppointmentsPage: Received appointments:', appointmentData);
        console.log('AppointmentsPage: Pagination:', pagination);
        
        setAppointments(appointmentData || []);
        setTotalPages(pagination?.pages || 1);
      } else {
        console.error('AppointmentsPage: Invalid response structure:', response);
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('AppointmentsPage: Error fetching appointments:', error);
      setError('Failed to load appointments: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
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

  const columns = [
    {
      header: 'Date & Time',
      accessor: 'appointmentDate',
      render: (appointment) => {
        try {
          const appointmentDate = new Date(appointment.appointmentDate);
          return (
            <div>
              <div className="font-medium">
                {format(appointmentDate, 'MMM dd, yyyy')}
              </div>
              <div className="text-sm text-gray-500">
                {appointment.timeSlot?.start || 'TBD'} - {appointment.timeSlot?.end || 'TBD'}
              </div>
            </div>
          );
        } catch (error) {
          console.error('Date formatting error:', error);
          return (
            <div>
              <div className="font-medium">Invalid Date</div>
              <div className="text-sm text-gray-500">
                {appointment.timeSlot?.start || 'TBD'} - {appointment.timeSlot?.end || 'TBD'}
              </div>
            </div>
          );
        }
      }
    },
    {
      header: 'Patient',
      accessor: 'patient',
      render: (appointment) => {
        const patient = appointment.patient;
        if (!patient) {
          return (
            <div>
              <div className="font-medium text-gray-400">No patient assigned</div>
              <div className="text-sm text-gray-500">-</div>
            </div>
          );
        }
        
        const patientName = patient.user?.fullName || 
                           `${patient.user?.firstName || ''} ${patient.user?.lastName || ''}`.trim() ||
                           'Unknown Patient';
        const patientPhone = patient.user?.phone || 'No phone';
        
        return (
          <div>
            <div className="font-medium">{patientName}</div>
            <div className="text-sm text-gray-500">{patientPhone}</div>
          </div>
        );
      }
    },
    {
      header: 'Doctor',
      accessor: 'doctor',
      render: (appointment) => {
        const doctor = appointment.doctor;
        if (!doctor) {
          return (
            <div>
              <div className="font-medium text-gray-400">No doctor assigned</div>
              <div className="text-sm text-gray-500">-</div>
            </div>
          );
        }
        
        const doctorName = doctor.fullName || 
                          `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() ||
                          'Unknown Doctor';
        
        return (
          <div>
            <div className="font-medium">{doctorName}</div>
            <div className="text-sm text-gray-500">{doctor.email || 'No email'}</div>
          </div>
        );
      }
    },
    {
      header: 'Treatment',
      accessor: 'treatment',
      render: (appointment) => {
        const treatment = appointment.treatment;
        if (!treatment) {
          return (
            <div>
              <div className="font-medium text-gray-400">No treatment assigned</div>
              <div className="text-sm text-gray-500">-</div>
            </div>
          );
        }
        
        const duration = treatment.duration?.session || appointment.duration || 'TBD';
        
        return (
          <div>
            <div className="font-medium">{treatment.name}</div>
            <div className="text-sm text-gray-500">{duration} mins</div>
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (appointment) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      )
    },
    {
      header: 'Notes',
      accessor: 'notes',
      render: (appointment) => (
        <div className="max-w-xs truncate">
          {appointment.notes || 'No notes'}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchAppointments}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Appointments"
        description="Manage and schedule patient appointments."
      >
        <button className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
          <PlusIcon className="h-5 w-5 mr-2" />
          New Appointment
        </button>
      </PageHeader>

      <div className="bg-white shadow-sm rounded-lg">
        {/* Filters and Search */}
        <div className="p-4 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <div className="max-w-lg w-full lg:max-w-xs">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">Today, Sep 18, 2025</span>
          </div>
        </div>

        {/* Table */}
        <Table
          data={appointments}
          columns={columns}
          keyField="_id"
          emptyMessage="No appointments found"
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage
          }}
        />
      </div>
    </div>
  );
}
