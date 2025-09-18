import React, { useState } from 'react';
import {
  CogIcon,
  UserIcon,
  BuildingOfficeIcon,
  BellIcon,
  ShieldCheckIcon,
  CurrencyRupeeIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '../Shared/PageHeader';

const settingsCategories = [
  {
    id: 'clinic',
    name: 'Clinic Information',
    icon: BuildingOfficeIcon,
    settings: [
      { key: 'clinicName', label: 'Clinic Name', value: 'Ayurveda Wellness Center', type: 'text' },
      { key: 'address', label: 'Address', value: '123 Health Street, Wellness City, 12345', type: 'textarea' },
      { key: 'phone', label: 'Phone Number', value: '+91 98765 43210', type: 'text' },
      { key: 'email', label: 'Email', value: 'contact@ayurvedawellness.com', type: 'email' },
      { key: 'website', label: 'Website', value: 'www.ayurvedawellness.com', type: 'text' },
    ]
  },
  {
    id: 'appointments',
    name: 'Appointment Settings',
    icon: CogIcon,
    settings: [
      { key: 'slotDuration', label: 'Appointment Slot Duration (minutes)', value: '60', type: 'number' },
      { key: 'bookingAdvance', label: 'Advance Booking Days', value: '30', type: 'number' },
      { key: 'workingHours', label: 'Working Hours', value: '09:00 - 18:00', type: 'text' },
      { key: 'workingDays', label: 'Working Days', value: 'Monday to Saturday', type: 'text' },
    ]
  },
  {
    id: 'notifications',
    name: 'Notification Settings',
    icon: BellIcon,
    settings: [
      { key: 'emailNotifications', label: 'Email Notifications', value: true, type: 'boolean' },
      { key: 'smsNotifications', label: 'SMS Notifications', value: true, type: 'boolean' },
      { key: 'appointmentReminders', label: 'Appointment Reminders', value: true, type: 'boolean' },
      { key: 'reminderTime', label: 'Reminder Time (hours before)', value: '24', type: 'number' },
    ]
  },
  {
    id: 'billing',
    name: 'Billing & Payments',
    icon: CurrencyRupeeIcon,
    settings: [
      { key: 'currency', label: 'Currency', value: 'INR', type: 'select', options: ['INR', 'USD', 'EUR'] },
      { key: 'taxRate', label: 'Tax Rate (%)', value: '18', type: 'number' },
      { key: 'paymentMethods', label: 'Accepted Payment Methods', value: 'Cash, Card, UPI, Net Banking', type: 'text' },
      { key: 'invoicePrefix', label: 'Invoice Number Prefix', value: 'AWC', type: 'text' },
    ]
  },
  {
    id: 'security',
    name: 'Security Settings',
    icon: ShieldCheckIcon,
    settings: [
      { key: 'sessionTimeout', label: 'Session Timeout (minutes)', value: '30', type: 'number' },
      { key: 'passwordPolicy', label: 'Strong Password Policy', value: true, type: 'boolean' },
      { key: 'twoFactorAuth', label: 'Two-Factor Authentication', value: false, type: 'boolean' },
      { key: 'loginAttempts', label: 'Max Login Attempts', value: '5', type: 'number' },
    ]
  },
];

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState('clinic');
  const [settings, setSettings] = useState(() => {
    const initialSettings = {};
    settingsCategories.forEach(category => {
      category.settings.forEach(setting => {
        initialSettings[setting.key] = setting.value;
      });
    });
    return initialSettings;
  });
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Here you would typically save the settings to a backend
    console.log('Saving settings:', settings);
    setHasChanges(false);
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    // Reset to original values
    const originalSettings = {};
    settingsCategories.forEach(category => {
      category.settings.forEach(setting => {
        originalSettings[setting.key] = setting.value;
      });
    });
    setSettings(originalSettings);
    setHasChanges(false);
  };

  const activeSettings = settingsCategories.find(cat => cat.id === activeCategory);

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage clinic settings and system configuration"
        icon={CogIcon}
      />

      <div className="flex">
        {/* Sidebar */}
        <div className="w-1/4 bg-white rounded-lg shadow-sm border border-gray-200 mr-6 h-fit">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Settings Categories</h3>
          </div>
          <nav className="p-2">
            {settingsCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {category.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <activeSettings.icon className="mr-2 h-5 w-5" />
                {activeSettings.name}
              </h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {activeSettings.settings.map((setting) => (
                  <div key={setting.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {setting.label}
                    </label>
                    {setting.type === 'text' && (
                      <input
                        type="text"
                        value={settings[setting.key] || ''}
                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    )}
                    {setting.type === 'email' && (
                      <input
                        type="email"
                        value={settings[setting.key] || ''}
                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    )}
                    {setting.type === 'number' && (
                      <input
                        type="number"
                        value={settings[setting.key] || ''}
                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    )}
                    {setting.type === 'textarea' && (
                      <textarea
                        value={settings[setting.key] || ''}
                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    )}
                    {setting.type === 'boolean' && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings[setting.key] || false}
                          onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">Enable this feature</span>
                      </div>
                    )}
                    {setting.type === 'select' && (
                      <select
                        value={settings[setting.key] || ''}
                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        {setting.options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={handleReset}
                  disabled={!hasChanges}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}