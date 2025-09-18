import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import PageHeader from '../Shared/PageHeader';
import Table from '../Shared/Table';

const mockPatients = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    dateOfBirth: '1985-05-15',
    gender: 'male',
    address: 'Bangalore, Karnataka',
    emergencyContact: '+91 98765 43211',
    medicalHistory: ['Hypertension', 'Diabetes'],
    prakriti: 'Vata-Pitta',
    vikriti: 'Vata aggravation',
    createdAt: '2025-01-15'
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 98765 43212',
    dateOfBirth: '1990-08-23',
    gender: 'female',
    address: 'Mumbai, Maharashtra',
    emergencyContact: '+91 98765 43213',
    medicalHistory: ['Asthma'],
    prakriti: 'Kapha-Pitta',
    vikriti: 'Kapha accumulation',
    createdAt: '2025-02-20'
  },
  {
    id: '3',
    name: 'Amit Kumar',
    email: 'amit.kumar@example.com',
    phone: '+91 98765 43214',
    dateOfBirth: '1978-12-10',
    gender: 'male',
    address: 'Delhi, NCR',
    emergencyContact: '+91 98765 43215',
    medicalHistory: ['Joint pain', 'Insomnia'],
    prakriti: 'Vata',
    vikriti: 'Vata aggravation',
    createdAt: '2025-03-05'
  },
  {
    id: '4',
    name: 'Meera Joshi',
    email: 'meera.joshi@example.com',
    phone: '+91 98765 43216',
    dateOfBirth: '1982-03-28',
    gender: 'female',
    address: 'Pune, Maharashtra',
    emergencyContact: '+91 98765 43217',
    medicalHistory: ['Digestive issues'],
    prakriti: 'Pitta',
    vikriti: 'Pitta aggravation',
    createdAt: '2025-03-15'
  },
  {
    id: '5',
    name: 'Suresh Reddy',
    email: 'suresh.reddy@example.com',
    phone: '+91 98765 43218',
    dateOfBirth: '1995-07-12',
    gender: 'male',
    address: 'Hyderabad, Telangana',
    emergencyContact: '+91 98765 43219',
    medicalHistory: ['Skin conditions'],
    prakriti: 'Pitta-Kapha',
    vikriti: 'Pitta aggravation',
    createdAt: '2025-03-18'
  },
];

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState(mockPatients);

  const columns = [
    {
      title: 'Patient Name',
      key: 'name',
      render: (patient) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-600 font-medium text-sm">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{patient.name}</div>
            <div className="text-sm text-gray-500">{patient.email}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Contact',
      key: 'phone',
      render: (patient) => (
        <div>
          <div className="text-sm text-gray-900">{patient.phone}</div>
          <div className="text-sm text-gray-500">{patient.address}</div>
        </div>
      )
    },
    {
      title: 'Age / Gender',
      key: 'dateOfBirth',
      render: (patient) => {
        const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
        return (
          <div>
            <div className="text-sm text-gray-900">{age} years</div>
            <div className="text-sm text-gray-500 capitalize">{patient.gender}</div>
          </div>
        );
      }
    },
    {
      title: 'Prakriti/Vikriti',
      key: 'prakriti',
      render: (patient) => (
        <div>
          <div className="text-sm text-gray-900">{patient.prakriti}</div>
          <div className="text-sm text-gray-500">{patient.vikriti}</div>
        </div>
      )
    },
    {
      title: 'Last Visit',
      key: 'createdAt',
      render: (patient) => (
        <div className="text-sm text-gray-900">
          {format(new Date(patient.createdAt), 'MMM dd, yyyy')}
        </div>
      )
    },
    {
      title: '',
      key: 'actions',
      render: () => (
        <button className="text-emerald-600 hover:text-emerald-900">
          <ChevronDownIcon className="h-5 w-5" />
        </button>
      )
    },
  ];

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = mockPatients.filter(patient => 
      patient.name.toLowerCase().includes(term) ||
      patient.email.toLowerCase().includes(term) ||
      patient.phone.includes(term)
    );
    setFilteredPatients(filtered);
  };

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
          data={filteredPatients}
          columns={columns}
          keyField="id"
          emptyMessage="No patients found"
        />
      </div>
    </div>
  );
}
