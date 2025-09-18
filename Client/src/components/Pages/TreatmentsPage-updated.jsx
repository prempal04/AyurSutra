import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import PageHeader from '../Shared/PageHeader';
import Table from '../Shared/Table';
import { treatmentsAPI } from '../../services/api';

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchTreatments();
  }, [currentPage, searchTerm, categoryFilter]);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
      };
      
      const response = await treatmentsAPI.getTreatments(params);
      const { treatments: treatmentData, pagination } = response.data;
      
      setTreatments(treatmentData);
      setTotalPages(pagination.pages);
    } catch (error) {
      setError('Failed to load treatments');
      console.error('Treatments error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'shamana':
        return 'bg-green-100 text-green-800';
      case 'shodhana':
        return 'bg-purple-100 text-purple-800';
      case 'rasayana':
        return 'bg-blue-100 text-blue-800';
      case 'satvavajaya':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      header: 'Treatment Name',
      accessor: 'name',
      render: (treatment) => (
        <div>
          <div className="font-medium text-gray-900">
            {treatment.name}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {treatment.duration} mins
          </div>
        </div>
      )
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (treatment) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 line-clamp-2">
            {treatment.description}
          </p>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (treatment) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getCategoryColor(treatment.category)}`}>
          {treatment.category}
        </span>
      )
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (treatment) => (
        <div className="text-sm font-medium text-gray-900">
          ₹{treatment.price}
        </div>
      )
    },
    {
      header: 'Benefits',
      accessor: 'benefits',
      render: (treatment) => (
        <div className="max-w-xs">
          <ul className="text-xs text-gray-600">
            {treatment.benefits?.slice(0, 2).map((benefit, index) => (
              <li key={index} className="mb-1">• {benefit}</li>
            ))}
            {treatment.benefits?.length > 2 && (
              <li className="text-gray-400">+{treatment.benefits.length - 2} more</li>
            )}
          </ul>
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
            onClick={fetchTreatments}
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
        title="Treatments"
        description="Manage Ayurvedic treatments and therapies."
      >
        <button className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Treatment
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
                  placeholder="Search treatments..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Categories</option>
              <option value="shamana">Shamana (Palliative)</option>
              <option value="shodhana">Shodhana (Purificatory)</option>
              <option value="rasayana">Rasayana (Rejuvenative)</option>
              <option value="satvavajaya">Satvavajaya (Psychotherapy)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <Table
          data={treatments}
          columns={columns}
          keyField="_id"
          emptyMessage="No treatments found"
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
