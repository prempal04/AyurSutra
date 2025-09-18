import React, { useState, useEffect } from 'react';
import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import { format, addDays, startOfDay } from 'date-fns';
import Modal from '../Shared/Modal';
import { appointmentsAPI, patientsAPI, treatmentsAPI, usersAPI } from '../../services/api';

export default function ScheduleAppointmentModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    treatmentId: '',
    appointmentDate: '',
    timeSlot: { start: '', end: '' },
    notes: '',
    priority: 'normal',
    status: 'scheduled'
  });
  
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate time slots for the day
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 60) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endHour = minute === 30 ? hour + 1 : hour;
        const endMinute = minute === 30 ? 0 : minute + 60;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        slots.push({
          start: startTime,
          end: endTime,
          label: `${startTime} - ${endTime}`
        });
      }
    }
    return slots;
  };

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
      setAvailableSlots(generateTimeSlots());
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load required data');
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'timeSlot') {
      setFormData(prev => ({ ...prev, timeSlot: value }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const appointmentData = {
        ...formData,
        appointmentDate: new Date(formData.appointmentDate).toISOString()
      };

      const response = await appointmentsAPI.createAppointment(appointmentData);
      console.log('Appointment created successfully:', response);
      onSuccess?.(response.data);
      onClose();
      
      // Reset form
      setFormData({
        patientId: '',
        doctorId: '',
        treatmentId: '',
        appointmentDate: '',
        timeSlot: { start: '', end: '' },
        notes: '',
        priority: 'normal',
        status: 'scheduled'
      });
      setStep(1);
    } catch (error) {
      console.error('Error creating appointment:', error);
      setError(error.message || 'Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedPatient = () => patients.find(p => p._id === formData.patientId);
  const getSelectedDoctor = () => doctors.find(d => d._id === formData.doctorId);
  const getSelectedTreatment = () => treatments.find(t => t._id === formData.treatmentId);

  const canProceed = () => {
    switch (step) {
      case 1: return formData.patientId && formData.doctorId;
      case 2: return formData.treatmentId;
      case 3: return formData.appointmentDate && formData.timeSlot.start;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Appointment" size="lg">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {[
            { step: 1, title: 'Patient & Doctor' },
            { step: 2, title: 'Treatment' },
            { step: 3, title: 'Date & Time' },
            { step: 4, title: 'Confirm' }
          ].map((item, index) => (
            <div key={item.step} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= item.step ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {item.step}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                step >= item.step ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {item.title}
              </span>
              {index < 3 && (
                <div className={`w-12 h-1 mx-4 ${
                  step > item.step ? 'bg-emerald-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Patient & Doctor */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Select Patient & Doctor</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
            </div>
          )}

          {/* Step 2: Treatment */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Select Treatment</h3>
              
              <div className="grid gap-3 max-h-80 overflow-y-auto">
                {treatments.map(treatment => (
                  <div
                    key={treatment._id}
                    onClick={() => handleInputChange('treatmentId', treatment._id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.treatmentId === treatment._id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{treatment.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{treatment.description}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Duration: {treatment.duration?.session || 60} minutes
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{treatment.pricing?.perSession || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">per session</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Date & Time */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Select Date & Time</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.appointmentDate}
                  onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  max={format(addDays(new Date(), 60), 'yyyy-MM-dd')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {formData.appointmentDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Slot *
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {availableSlots.map(slot => (
                      <button
                        key={slot.start}
                        type="button"
                        onClick={() => handleInputChange('timeSlot', slot)}
                        className={`p-2 text-sm rounded-md border ${
                          formData.timeSlot.start === slot.start
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Any additional notes or special instructions"
                />
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Appointment Details</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Patient:</span>
                    <div className="mt-1">
                      {getSelectedPatient()?.user?.firstName} {getSelectedPatient()?.user?.lastName}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Doctor:</span>
                    <div className="mt-1">
                      Dr. {getSelectedDoctor()?.firstName} {getSelectedDoctor()?.lastName}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Treatment:</span>
                    <div className="mt-1">{getSelectedTreatment()?.name}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date & Time:</span>
                    <div className="mt-1">
                      {format(new Date(formData.appointmentDate), 'MMM dd, yyyy')} at {formData.timeSlot.start}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Priority:</span>
                    <div className="mt-1 capitalize">{formData.priority}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <div className="mt-1">{getSelectedTreatment()?.duration?.session || 60} minutes</div>
                  </div>
                </div>
                
                {formData.notes && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-700">Notes:</span>
                    <div className="mt-1 text-sm">{formData.notes}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={step === 1 ? onClose : handlePrevious}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              {step === 1 ? 'Cancel' : 'Previous'}
            </button>
            
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Scheduling...' : 'Schedule Appointment'}
              </button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
}
