import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import PageHeader from '../Shared/PageHeader';
import Table from '../Shared/Table';
import { patientsAPI } from '../../services/api';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPatients();
  }, [currentPage, searchTerm]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
      };
      
      const response = await patientsAPI.getPatients(params);
      const { patients: patientData, pagination } = response.data;
      
      setPatients(patientData);
      setTotalPages(pagination.pages);
    } catch (error) {
      setError('Failed to load patients');
      console.error('Patients error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const columns = [
    {
      title: 'Patient Name',
      key: 'name',
      render: (patient) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-600 font-medium text-sm">
                {patient.user?.firstName?.charAt(0)}{patient.user?.lastName?.charAt(0)}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {patient.user?.fullName || `${patient.user?.firstName} ${patient.user?.lastName}`}
            </div>
            <div className="text-sm text-gray-500">{patient.user?.email}</div>
            <div className="text-xs text-gray-400">ID: {patient.patientId}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Contact',
      key: 'phone',
      render: (patient) => (
        <div>
          <div className="text-sm text-gray-900">{patient.user?.phone}</div>
          <div className="text-sm text-gray-500">
            {patient.address?.city}, {patient.address?.state}
          </div>
        </div>
      )
    },
    {
      title: 'Demographics',
      key: 'demographics',
      render: (patient) => (
        <div>
          <div className="text-sm text-gray-900">
            {patient.gender} • Age {patient.age}
          </div>
          <div className="text-sm text-gray-500">{patient.bloodGroup}</div>
        </div>
      )
    },
    {
      title: 'Ayurvedic Profile',
      key: 'dosha',
      render: (patient) => (
        <div>
          <div className="text-sm text-gray-900">
            Prakriti: {patient.prakriti?.dominantDosha}
          </div>
          <div className="text-sm text-gray-500">
            {patient.vikriti?.imbalance && `Current: ${patient.vikriti.imbalance}`}
          </div>
        </div>
      )
    },
    {
      title: 'Medical History',
      key: 'history',
      render: (patient) => (
        <div>
          {patient.medicalHistory?.length > 0 ? (
            <div className="text-sm text-gray-900">
              {patient.medicalHistory.slice(0, 2).map(h => h.condition).join(', ')}
              {patient.medicalHistory.length > 2 && '...'}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No history</div>
          )}
        </div>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (patient) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          patient.isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {patient.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchPatients}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
        title="Patients"
        description="Manage your patient records and view their treatment history."
      >
        <button className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Add Patient
        </button>
      </PageHeader>
      
      <div className="bg-white shadow-sm rounded-lg">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
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
                placeholder="Search patients..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <Table
          data={patients}
          columns={columns}
          keyField="id"
          emptyMessage="No patients found"
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
