import React, { useState, useEffect } from 'react';
import { ChartBarIcon, ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import Modal from '../Shared/Modal';
import { reportsAPI } from '../../services/api';

export default function ViewReportsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('appointments');
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [reports, setReports] = useState({
    appointments: null,
    treatments: null,
    financial: null,
    patients: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tabs = [
    { id: 'appointments', name: 'Appointments', icon: ChartBarIcon },
    { id: 'treatments', name: 'Treatments', icon: ChartBarIcon },
    { id: 'financial', name: 'Financial', icon: ChartBarIcon },
    { id: 'patients', name: 'Patients', icon: ChartBarIcon }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchReports();
    }
  }, [isOpen, activeTab, dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };

      let reportData;
      switch (activeTab) {
        case 'appointments':
          reportData = await reportsAPI.getAppointmentReports(params);
          break;
        case 'treatments':
          reportData = await reportsAPI.getTreatmentReports(params);
          break;
        case 'financial':
          reportData = await reportsAPI.getFinancialReports(params);
          break;
        case 'patients':
          reportData = await reportsAPI.getPatientReports(params);
          break;
        default:
          reportData = { data: null };
      }

      setReports(prev => ({
        ...prev,
        [activeTab]: reportData.data
      }));
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error.message || 'Failed to load reports');
      
      // Mock data for demonstration
      setReports(prev => ({
        ...prev,
        [activeTab]: getMockReportData(activeTab)
      }));
    } finally {
      setLoading(false);
    }
  };

  const getMockReportData = (reportType) => {
    switch (reportType) {
      case 'appointments':
        return {
          summary: {
            total: 45,
            completed: 38,
            cancelled: 4,
            pending: 3
          },
          byStatus: [
            { status: 'Completed', count: 38, percentage: 84.4 },
            { status: 'Cancelled', count: 4, percentage: 8.9 },
            { status: 'Pending', count: 3, percentage: 6.7 }
          ],
          byDoctor: [
            { doctor: 'Dr. Priya Sharma', appointments: 18 },
            { doctor: 'Dr. Rajesh Kumar', appointments: 15 },
            { doctor: 'Dr. Anita Desai', appointments: 12 }
          ],
          trends: [
            { date: '2025-09-01', count: 8 },
            { date: '2025-09-08', count: 12 },
            { date: '2025-09-15', count: 15 },
            { date: '2025-09-22', count: 10 }
          ]
        };
      
      case 'treatments':
        return {
          summary: {
            totalSessions: 156,
            uniqueTreatments: 8,
            completionRate: 92.3
          },
          popular: [
            { treatment: 'Abhyanga', sessions: 45, revenue: 112500 },
            { treatment: 'Shirodhara', sessions: 32, revenue: 128000 },
            { treatment: 'Panchakarma', sessions: 28, revenue: 420000 },
            { treatment: 'Nasya', sessions: 25, revenue: 75000 },
            { treatment: 'Basti', sessions: 26, revenue: 130000 }
          ],
          effectiveness: [
            { treatment: 'Abhyanga', successRate: 95 },
            { treatment: 'Shirodhara', successRate: 93 },
            { treatment: 'Panchakarma', successRate: 89 },
            { treatment: 'Nasya', successRate: 91 }
          ]
        };
      
      case 'financial':
        return {
          summary: {
            totalRevenue: 865500,
            paidAmount: 821750,
            pendingAmount: 43750,
            averagePerSession: 5547
          },
          paymentMethods: [
            { method: 'Cash', amount: 450000, percentage: 52 },
            { method: 'Card', amount: 280000, percentage: 32.3 },
            { method: 'UPI', amount: 91750, percentage: 10.6 },
            { method: 'Bank Transfer', amount: 43750, percentage: 5.1 }
          ],
          monthlyTrend: [
            { month: 'July', revenue: 245000 },
            { month: 'August', revenue: 298500 },
            { month: 'September', revenue: 322000 }
          ]
        };
      
      case 'patients':
        return {
          summary: {
            totalPatients: 127,
            newPatients: 18,
            activePatients: 89,
            retentionRate: 78.5
          },
          demographics: [
            { ageGroup: '18-30', count: 32, percentage: 25.2 },
            { ageGroup: '31-45', count: 45, percentage: 35.4 },
            { ageGroup: '46-60', count: 38, percentage: 29.9 },
            { ageGroup: '60+', count: 12, percentage: 9.4 }
          ],
          genderDistribution: [
            { gender: 'Female', count: 74, percentage: 58.3 },
            { gender: 'Male', count: 53, percentage: 41.7 }
          ],
          doshaDistribution: [
            { dosha: 'Vata', count: 52, percentage: 40.9 },
            { dosha: 'Pitta', count: 38, percentage: 29.9 },
            { dosha: 'Kapha', count: 37, percentage: 29.1 }
          ]
        };
      
      default:
        return null;
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const handleExport = (format) => {
    // Mock export functionality
    const data = reports[activeTab];
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_report_${format.toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderReportContent = () => {
    const data = reports[activeTab];
    if (!data) return null;

    switch (activeTab) {
      case 'appointments':
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{data.summary.total}</div>
                <div className="text-sm text-blue-800">Total Appointments</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{data.summary.completed}</div>
                <div className="text-sm text-green-800">Completed</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{data.summary.cancelled}</div>
                <div className="text-sm text-red-800">Cancelled</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{data.summary.pending}</div>
                <div className="text-sm text-yellow-800">Pending</div>
              </div>
            </div>

            {/* Appointments by Doctor */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Appointments by Doctor</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {data.byDoctor.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-700">{item.doctor}</span>
                    <span className="font-medium text-gray-900">{item.appointments}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'treatments':
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{data.summary.totalSessions}</div>
                <div className="text-sm text-purple-800">Total Sessions</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{data.summary.uniqueTreatments}</div>
                <div className="text-sm text-indigo-800">Unique Treatments</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{data.summary.completionRate}%</div>
                <div className="text-sm text-green-800">Completion Rate</div>
              </div>
            </div>

            {/* Popular Treatments */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Popular Treatments</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Treatment</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sessions</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.popular.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.treatment}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{item.sessions}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">₹{item.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'financial':
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">₹{(data.summary.totalRevenue / 1000).toFixed(0)}K</div>
                <div className="text-sm text-green-800">Total Revenue</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">₹{(data.summary.paidAmount / 1000).toFixed(0)}K</div>
                <div className="text-sm text-blue-800">Paid Amount</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">₹{(data.summary.pendingAmount / 1000).toFixed(0)}K</div>
                <div className="text-sm text-orange-800">Pending</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">₹{data.summary.averagePerSession}</div>
                <div className="text-sm text-purple-800">Avg per Session</div>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Payment Methods</h4>
              <div className="space-y-3">
                {data.paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{method.method}</span>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">₹{method.amount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{method.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'patients':
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{data.summary.totalPatients}</div>
                <div className="text-sm text-blue-800">Total Patients</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{data.summary.newPatients}</div>
                <div className="text-sm text-green-800">New Patients</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{data.summary.activePatients}</div>
                <div className="text-sm text-purple-800">Active Patients</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{data.summary.retentionRate}%</div>
                <div className="text-sm text-orange-800">Retention Rate</div>
              </div>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Age Distribution</h4>
                <div className="space-y-2">
                  {data.demographics.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">{item.ageGroup}</span>
                      <div className="text-right">
                        <span className="font-medium text-gray-900">{item.count}</span>
                        <span className="text-sm text-gray-500 ml-2">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Dosha Distribution</h4>
                <div className="space-y-2">
                  {data.doshaDistribution.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">{item.dosha}</span>
                      <div className="text-right">
                        <span className="font-medium text-gray-900">{item.count}</span>
                        <span className="text-sm text-gray-500 ml-2">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-center text-gray-500 py-8">No data available</div>;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reports & Analytics" size="2xl">
      <div className="space-y-6">
        {/* Date Range Selector */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="flex space-x-2 mt-6">
            <button
              onClick={() => handleExport('PDF')}
              className="px-3 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 inline mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Report Content */}
        <div className="min-h-64">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : error ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-800">{error}</p>
              <p className="text-xs text-yellow-600 mt-1">Showing demo data for preview</p>
            </div>
          ) : null}
          
          {renderReportContent()}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
