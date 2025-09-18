import React, { useState, useEffect } from 'react';
import { HeartIcon, ClockIcon } from '@heroicons/react/24/outline';
import { format, addDays } from 'date-fns';
import Modal from '../Shared/Modal';
import { treatmentPlansAPI, patientsAPI, treatmentsAPI, usersAPI } from '../../services/api';

export default function CreateTreatmentPlanModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    title: '',
    description: '',
    treatments: [],
    startDate: '',
    endDate: '',
    totalSessions: 1,
    frequency: 'daily',
    notes: '',
    priority: 'normal',
    status: 'draft'
  });
  
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [selectedTreatments, setSelectedTreatments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  const fetchInitialData = async () => {
    try {
      const [patientsRes, doctorsRes, treatmentsRes] = await Promise.all([
        patientsAPI.getPatients({ limit: 100 }),
        usersAPI.getUsers({ role: 'doctor', limit: 100 }),
        treatmentsAPI.getTreatments({ limit: 100 })
      ]);

      setPatients(patientsRes.data?.patients || []);
      setDoctors(doctorsRes.data?.users || []);
      setTreatments(treatmentsRes.data?.treatments || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load required data');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTreatmentToggle = (treatment) => {
    const isSelected = selectedTreatments.find(t => t._id === treatment._id);
    
    if (isSelected) {
      setSelectedTreatments(prev => prev.filter(t => t._id !== treatment._id));
    } else {
      setSelectedTreatments(prev => [...prev, { 
        ...treatment, 
        sessions: 1,
        frequency: 'daily',
        duration: treatment.duration?.session || 60
      }]);
    }
  };

  const handleTreatmentChange = (treatmentId, field, value) => {
    setSelectedTreatments(prev => 
      prev.map(t => 
        t._id === treatmentId ? { ...t, [field]: value } : t
      )
    );
  };

  const calculateTotalSessions = () => {
    return selectedTreatments.reduce((total, treatment) => total + (treatment.sessions || 1), 0);
  };

  const calculateEstimatedDuration = () => {
    if (!formData.startDate || !formData.frequency) return '';
    
    const totalSessions = calculateTotalSessions();
    const frequencyDays = {
      'daily': 1,
      'alternate': 2,
      'weekly': 7,
      'biweekly': 14
    };
    
    const days = totalSessions * frequencyDays[formData.frequency];
    const endDate = addDays(new Date(formData.startDate), days);
    
    return format(endDate, 'yyyy-MM-dd');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const treatmentPlanData = {
        ...formData,
        treatments: selectedTreatments.map(t => ({
          treatment: t._id,
          sessions: t.sessions,
          frequency: t.frequency,
          duration: t.duration,
          completed: false
        })),
        totalSessions: calculateTotalSessions(),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : new Date(calculateEstimatedDuration()).toISOString()
      };

      const response = await treatmentPlansAPI.createTreatmentPlan(treatmentPlanData);
      console.log('Treatment plan created successfully:', response);
      onSuccess?.(response.data);
      onClose();
      
      // Reset form
      setFormData({
        patientId: '',
        doctorId: '',
        title: '',
        description: '',
        treatments: [],
        startDate: '',
        endDate: '',
        totalSessions: 1,
        frequency: 'daily',
        notes: '',
        priority: 'normal',
        status: 'draft'
      });
      setSelectedTreatments([]);
    } catch (error) {
      console.error('Error creating treatment plan:', error);
      setError(error.message || 'Failed to create treatment plan');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedPatient = () => patients.find(p => p._id === formData.patientId);
  const getSelectedDoctor = () => doctors.find(d => d._id === formData.doctorId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Treatment Plan" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient *
            </label>
            <select
              required
              value={formData.patientId}
              onChange={(e) => handleInputChange('patientId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select a patient</option>
              {patients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.user?.firstName} {patient.user?.lastName} - {patient.patientId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doctor *
            </label>
            <select
              required
              value={formData.doctorId}
              onChange={(e) => handleInputChange('doctorId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select a doctor</option>
              {doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.firstName} {doctor.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Treatment Plan Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., Panchakarma Detox Program"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Describe the treatment plan objectives and approach"
            />
          </div>
        </div>

        {/* Treatment Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Select Treatments</h3>
          <div className="grid gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-4">
            {treatments.map(treatment => {
              const isSelected = selectedTreatments.find(t => t._id === treatment._id);
              return (
                <div
                  key={treatment._id}
                  className={`p-3 border rounded-lg ${
                    isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={() => handleTreatmentToggle(treatment)}
                        className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{treatment.name}</h4>
                        <p className="text-sm text-gray-600">{treatment.description}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {treatment.duration?.session || 60} minutes
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium text-gray-900">
                        ₹{treatment.pricing?.perSession || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">per session</div>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Sessions
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={isSelected.sessions}
                          onChange={(e) => handleTreatmentChange(treatment._id, 'sessions', parseInt(e.target.value))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Frequency
                        </label>
                        <select
                          value={isSelected.frequency}
                          onChange={(e) => handleTreatmentChange(treatment._id, 'frequency', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="daily">Daily</option>
                          <option value="alternate">Alternate days</option>
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Bi-weekly</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {selectedTreatments.length > 0 && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-md">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-emerald-800">
                  Total Sessions: {calculateTotalSessions()}
                </span>
                {formData.startDate && (
                  <span className="text-emerald-600">
                    Estimated End: {format(new Date(calculateEstimatedDuration()), 'MMM dd, yyyy')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Schedule Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Schedule Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                min={formData.startDate}
                placeholder={calculateEstimatedDuration()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for auto-calculation based on treatments
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Special instructions, precautions, or observations"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || selectedTreatments.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Treatment Plan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
