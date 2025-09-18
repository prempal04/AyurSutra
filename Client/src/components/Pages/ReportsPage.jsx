import React from 'react';
import {
  UsersIcon,
  CalendarDaysIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '../Shared/PageHeader';

const revenueData = [
  { month: 'Jan', amount: 245000 },
  { month: 'Feb', amount: 267000 },
  { month: 'Mar', amount: 289000 },
  { month: 'Apr', amount: 312000 },
  { month: 'May', amount: 298000 },
  { month: 'Jun', amount: 334000 },
  { month: 'Jul', amount: 356000 },
  { month: 'Aug', amount: 378000 },
  { month: 'Sep', amount: 345000 },
];

const stats = [
  {
    name: 'Total Patients',
    value: '247',
    change: '+12.5%',
    changeType: 'increase',
    icon: UsersIcon,
  },
  {
    name: 'Monthly Appointments',
    value: '186',
    change: '+8.2%',
    changeType: 'increase',
    icon: CalendarDaysIcon,
  },
  {
    name: 'Revenue (YTD)',
    value: '₹28.6L',
    change: '+18.4%',
    changeType: 'increase',
    icon: CurrencyRupeeIcon,
  },
  {
    name: 'Treatment Success Rate',
    value: '92%',
    change: '-0.5%',
    changeType: 'decrease',
    icon: ChartBarIcon,
  },
];

const treatmentDistribution = [
  { name: 'Panchakarma', value: 35 },
  { name: 'Abhyanga', value: 25 },
  { name: 'Shirodhara', value: 20 },
  { name: 'Basti', value: 12 },
  { name: 'Others', value: 8 },
];

const patientDemographics = [
  { age: '18-30', male: 28, female: 32 },
  { age: '31-45', male: 45, female: 48 },
  { age: '46-60', male: 35, female: 38 },
  { age: '60+', male: 12, female: 9 },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="View insights and performance metrics for your clinic."
      />
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow-sm rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-emerald-500 rounded-md p-3">
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.changeType === 'increase'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {stat.changeType === 'increase' ? (
                  <ArrowUpIcon
                    className="h-4 w-4 flex-shrink-0 self-center"
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowDownIcon
                    className="h-4 w-4 flex-shrink-0 self-center"
                    aria-hidden="true"
                  />
                )}
                <span className="ml-1">{stat.change}</span>
              </p>
            </dd>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Monthly Revenue
          </h3>
          <div className="h-80">
            <div className="h-full flex items-end space-x-2">
              {revenueData.map((data) => (
                <div
                  key={data.month}
                  className="flex-1 flex flex-col items-center"
                >
                  <div
                    className="w-full bg-emerald-100 rounded-t"
                    style={{
                      height: `${(data.amount / 400000) * 100}%`,
                    }}
                  />
                  <div className="mt-2 text-sm text-gray-500">{data.month}</div>
                  <div className="text-xs text-gray-400">
                    ₹{(data.amount / 1000).toFixed(0)}k
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Treatment Distribution */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Treatment Distribution
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              {treatmentDistribution.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-medium text-gray-900">{item.value}%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center">
              <div className="w-full aspect-square bg-emerald-50 rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600">
                    {treatmentDistribution[0].value}%
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {treatmentDistribution[0].name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Patient Demographics */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Patient Demographics
          </h3>
          <div className="space-y-4">
            {patientDemographics.map((group) => (
              <div key={group.age}>
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>{group.age} years</span>
                  <span>{group.male + group.female} patients</span>
                </div>
                <div className="flex h-4 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500"
                    style={{
                      width: `${(group.male / (group.male + group.female)) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-pink-500"
                    style={{
                      width: `${(group.female / (group.male + group.female)) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>♂ Male: {group.male}</span>
                  <span>♀ Female: {group.female}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
              <span className="text-sm text-gray-500">Male</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-pink-500 rounded-full mr-2" />
              <span className="text-sm text-gray-500">Female</span>
            </div>
          </div>
        </div>
        {/* Common Conditions */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top Health Conditions
          </h3>
          <div className="space-y-4">
            {[
              { name: 'Joint Pain & Arthritis', count: 58, change: '+12%' },
              { name: 'Digestive Issues', count: 45, change: '+8%' },
              { name: 'Stress & Anxiety', count: 42, change: '+15%' },
              { name: 'Skin Conditions', count: 36, change: '+5%' },
              { name: 'Respiratory Problems', count: 28, change: '-3%' },
            ].map((condition, index) => (
              <div
                key={condition.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <span className="text-lg font-medium text-gray-400 w-6">
                    {index + 1}
                  </span>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {condition.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {condition.count} patients
                    </div>
                  </div>
                </div>
                <span
                  className={`text-sm font-medium ${
                    condition.change.startsWith('+')
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {condition.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
