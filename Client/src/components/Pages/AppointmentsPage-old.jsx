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
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };
      
      const response = await appointmentsAPI.getAppointments(params);
      const { appointments: appointmentData, pagination } = response.data;
      
      setAppointments(appointmentData);
      setTotalPages(pagination.pages);
    } catch (error) {
      setError('Failed to load appointments');
      console.error('Appointments error:', error);
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
  },
  {
    id: '3',
    patientId: 'p3',
    doctorId: 'd1',
    treatmentId: 't3',
    date: '2025-09-20',
    time: '14:00',
    status: 'scheduled',
    notes: 'Initial consultation',
  },
  {
    id: '4',
    patientId: 'p4',
    doctorId: 'd1',
    treatmentId: 't4',
    date: '2025-09-20',
    time: '15:30',
    status: 'completed',
    notes: 'Treatment session',
    followUp: '2025-09-27',
  },
  {
    id: '5',
    patientId: 'p5',
    doctorId: 'd1',
    treatmentId: 't5',
    date: '2025-09-20',
    time: '16:00',
    status: 'scheduled',
    notes: 'Panchakarma session',
  },
];

const mockPatientNames = {
  p1: 'Rahul Sharma',
  p2: 'Priya Patel',
  p3: 'Anita Desai',
  p4: 'Vikram Singh',
  p5: 'Meera Joshi',
};

const mockTreatments = {
  t1: 'Abhyanga + Shirodhara',
  t2: 'Nasyam',
  t3: 'Initial Consultation',
  t4: 'Panchakarma Therapy',
  t5: 'Basti Treatment',
};

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState(mockAppointments);

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
      title: 'Time',
      key: 'time',
      render: (appointment) => (
        <div className="flex items-center">
          <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {format(new Date(`${appointment.date}T${appointment.time}`), 'h:mm a')}
            </div>
            <div className="text-sm text-gray-500">
              {format(new Date(appointment.date), 'MMM dd, yyyy')}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Patient',
      key: 'patientId',
      render: (appointment) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-600 font-medium text-sm">
                {mockPatientNames[appointment.patientId]?.charAt(0)}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {mockPatientNames[appointment.patientId]}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Treatment',
      key: 'treatmentId',
      render: (appointment) => (
        <div className="text-sm text-gray-900">
          {mockTreatments[appointment.treatmentId]}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (appointment) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      ),
    },
    {
      title: 'Notes',
      key: 'notes',
      render: (appointment) => (
        <div>
          <div className="text-sm text-gray-900">{appointment.notes}</div>
          {appointment.followUp && (
            <div className="text-sm text-gray-500">
              Follow-up: {format(new Date(appointment.followUp), 'MMM dd, yyyy')}
            </div>
          )}
        </div>
      ),
    },
  ];

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = mockAppointments.filter(appointment => {
      const patientName = mockPatientNames[appointment.patientId].toLowerCase();
      const treatment = mockTreatments[appointment.treatmentId].toLowerCase();
      return (
        patientName.includes(term) ||
        treatment.includes(term) ||
        appointment.status.includes(term)
      );
    });
    setFilteredAppointments(filtered);
  };

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
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">Today, Sep 18, 2025</span>
          </div>
        </div>
        {/* Table */}
        <Table
          data={filteredAppointments}
          columns={columns}
          keyField="id"
          emptyMessage="No appointments found"
        />
      </div>
    </div>
  );
}
