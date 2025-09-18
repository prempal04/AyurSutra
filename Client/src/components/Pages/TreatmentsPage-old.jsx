import React, { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import PageHeader from '../Shared/PageHeader';
import Table from '../Shared/Table';

const mockTreatments = [
  {
    id: '1',
    name: 'Abhyanga + Shirodhara',
    description: 'Full body massage with warm medicated oil followed by a continuous flow of warm oil on the forehead.',
    duration: '90 mins',
    benefits: [
      'Reduces stress and anxiety',
      'Improves sleep quality',
      'Nourishes the body and mind',
      'Balances Vata dosha'
    ],
    contraindications: [
      'Fever',
      'Acute illness',
      'First day of menstruation',
      'Pregnancy (first trimester)'
    ],
    category: 'shamana'
  },
  {
    id: '2',
    name: 'Panchakarma Detox Program',
    description: 'A comprehensive cleansing and rejuvenation program that includes multiple therapeutic treatments.',
    duration: '7-21 days',
    benefits: [
      'Deep cleansing of body tissues',
      'Removes accumulated toxins',
      'Restores metabolic functions',
      'Enhances immunity'
    ],
    contraindications: [
      'Severe weakness',
      'Acute diseases',
      'Pregnancy',
      'Recent surgery'
    ],
    category: 'shodhana'
  },
  {
    id: '3',
    name: 'Nasya Therapy',
    description: 'Administration of medicated oils or powders through the nasal passages.',
    duration: '45 mins',
    benefits: [
      'Clears sinus congestion',
      'Improves mental clarity',
      'Strengthens sensory organs',
      'Benefits eyes and vision'
    ],
    contraindications: [
      'Nasal bleeding',
      'Recent head injury',
      'Severe cold or flu',
      'After heavy meals'
    ],
    category: 'shodhana'
  },
  {
    id: '4',
    name: 'Chyawanprash Treatment',
    description: 'Administration of traditional herbal jam formula to boost immunity and vitality.',
    duration: '3 months',
    benefits: [
      'Strengthens immune system',
      'Improves digestion',
      'Enhances energy levels',
      'Anti-aging benefits'
    ],
    contraindications: [
      'Diabetes (without supervision)',
      'High blood sugar',
      'Acute fever',
      'Digestive disorders'
    ],
    category: 'rasayana'
  },
  {
    id: '5',
    name: 'Meditation and Pranayama',
    description: 'Guided meditation and breathing exercises for mental well-being.',
    duration: '60 mins',
    benefits: [
      'Reduces stress and anxiety',
      'Improves concentration',
      'Balances emotions',
      'Enhances self-awareness'
    ],
    contraindications: [
      'None',
    ],
    category: 'satvavajaya'
  },
];

export default function TreatmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTreatments, setFilteredTreatments] = useState(mockTreatments);

  const columns = [
    {
      title: 'Treatment Name',
      key: 'name',
      render: (treatment) => (
        <div className="text-sm font-medium text-gray-900">{treatment.name}</div>
      ),
    },
    {
      title: 'Description',
      key: 'description',
      render: (treatment) => (
        <div className="text-sm text-gray-500 max-w-xs truncate">{treatment.description}</div>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (treatment) => (
        <span className="text-xs text-gray-700">{treatment.duration}</span>
      ),
    },
    {
      title: 'Category',
      key: 'category',
      render: (treatment) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 capitalize">
          {treatment.category}
        </span>
      ),
    },
  ];

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFilteredTreatments(
      mockTreatments.filter((treatment) =>
        treatment.name.toLowerCase().includes(value.toLowerCase()) ||
        treatment.description.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Treatments"
        description="View and manage available treatments."
        actionLabel="Add Treatment"
        actionIcon={PlusIcon}
        onAction={() => {}}
      />
      <div className="flex items-center mb-4">
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            placeholder="Search treatments..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        </div>
      </div>
      <Table columns={columns} data={filteredTreatments} />
    </div>
  );
}
