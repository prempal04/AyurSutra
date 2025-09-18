import React, { useState } from 'react';
import { ClipboardDocumentListIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import PageHeader from '../Shared/PageHeader';
import Table from '../Shared/Table';

const mockTreatmentPlans = [
  {
    id: '1',
    patientId: 'p1',
    treatments: ['t1', 't2', 't3'],
    startDate: '2025-09-01',
    endDate: '2025-10-01',
    sessions: 12,
    completedSessions: 4,
    notes: 'Panchakarma detox program with follow-up treatments',
    status: 'active'
  },
  {
    id: '2',
    patientId: 'p2',
    treatments: ['t4', 't5'],
    startDate: '2025-09-10',
    endDate: '2025-09-30',
    sessions: 8,
    completedSessions: 2,
    notes: 'Joint pain management program',
    status: 'active'
  },
  {
    id: '3',
    patientId: 'p3',
    treatments: ['t1', 't3'],
    startDate: '2025-08-15',
    endDate: '2025-09-15',
    sessions: 10,
    completedSessions: 10,
    notes: 'Stress management and relaxation therapy',
    status: 'completed'
  },
  {
    id: '4',
    patientId: 'p4',
    treatments: ['t2'],
    startDate: '2025-09-05',
    endDate: '2025-10-05',
    sessions: 6,
    completedSessions: 1,
    notes: 'Digestive health improvement program',
    status: 'active'
  },
  {
    id: '5',
    patientId: 'p5',
    treatments: ['t4', 't5'],
    startDate: '2025-08-20',
    endDate: '2025-09-20',
    sessions: 8,
    completedSessions: 4,
    notes: 'Immunity boosting program',
    status: 'paused'
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
  t1: 'Abhyanga',
  t2: 'Shirodhara',
  t3: 'Basti',
  t4: 'Nasya',
  t5: 'Pizhichil',
};

function getStatusColor(status) {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    case 'paused':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function TreatmentPlansPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlans, setFilteredPlans] = useState(mockTreatmentPlans);

  const columns = [
    {
      title: 'Patient',
      key: 'patientId',
      render: (plan) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-600 font-medium text-sm">
                {mockPatientNames[plan.patientId]?.charAt(0)}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {mockPatientNames[plan.patientId]}
            </div>
            <div className="text-xs text-gray-500">
              {plan.treatments.map(t => mockTreatments[t]).join(', ')}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (plan) => (
        <div className="w-full">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-900">
              {Math.round((plan.completedSessions / plan.sessions) * 100)}%
            </span>
            <span className="text-sm text-gray-500">
              {plan.completedSessions}/{plan.sessions} sessions
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full"
              style={{ width: `${(plan.completedSessions / plan.sessions) * 100}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Dates & Status',
      key: 'dates',
      render: (plan) => (
        <div>
          <div className="text-sm text-gray-900">
            {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
          </div>
          <span
            className={`inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(plan.status)}`}
          >
            {plan.status}
          </span>
        </div>
      ),
    },
    {
      title: 'Notes',
      key: 'notes',
      render: (plan) => (
        <div className="text-sm text-gray-500 max-w-xs truncate">
          {plan.notes}
        </div>
      ),
    },
  ];

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = mockTreatmentPlans.filter(plan => {
      const patientName = mockPatientNames[plan.patientId].toLowerCase();
      const treatments = plan.treatments
        .map(t => mockTreatments[t].toLowerCase())
        .join(' ');
      return (
        patientName.includes(term) ||
        treatments.includes(term) ||
        plan.notes.toLowerCase().includes(term) ||
        plan.status.includes(term)
      );
    });
    setFilteredPlans(filtered);
  };

  return (
    <div>
      <PageHeader
        title="Treatment Plans"
        description="Manage and monitor patient treatment plans and progress."
      >
        <button className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
          <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
          Create Plan
        </button>
      </PageHeader>
      <div className="bg-white shadow-sm rounded-lg">
        {/* Search */}
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
                placeholder="Search treatment plans..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
        {/* Table */}
        <Table
          data={filteredPlans}
          columns={columns}
          keyField="id"
          emptyMessage="No treatment plans found"
        />
      </div>
    </div>
  );
}
