import React, { useState } from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { format, addDays, isSameDay } from 'date-fns';
import PageHeader from '../Shared/PageHeader';

const mockDoctors = [
  {
    id: 'd1',
    name: 'Dr. Ayurveda Kumar',
    specialization: 'General Ayurveda, Panchakarma',
    experience: '15 years',
    image: '/api/placeholder/64/64',
  },
  {
    id: 'd2',
    name: 'Dr. Priya Sharma',
    specialization: 'Women\'s Health, Pregnancy Care',
    experience: '12 years',
    image: '/api/placeholder/64/64',
  },
  {
    id: 'd3',
    name: 'Dr. Rajesh Patel',
    specialization: 'Joint & Muscle Care, Sports Medicine',
    experience: '18 years',
    image: '/api/placeholder/64/64',
  },
];

const mockTreatments = [
  {
    id: 't1',
    name: 'Abhyanga + Shirodhara',
    description: 'Full body massage with warm medicated oil followed by continuous oil flow on forehead',
    duration: '90 mins',
    price: '₹3,500',
  },
  {
    id: 't2',
    name: 'Panchakarma Consultation',
    description: 'Initial consultation for panchakarma treatment planning',
    duration: '45 mins',
    price: '₹1,500',
  },
  {
    id: 't3',
    name: 'Nasya Therapy',
    description: 'Medicated oil/powder administration through nasal passages',
    duration: '45 mins',
    price: '₹2,000',
  },
  {
    id: 't4',
    name: 'Basti Therapy',
    description: 'Medicated enema for deep cleansing and nourishment',
    duration: '60 mins',
    price: '₹2,500',
  },
  {
    id: 't5',
    name: 'General Consultation',
    description: 'Health assessment and treatment recommendations',
    duration: '30 mins',
    price: '₹1,000',
  },
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

// Mock unavailable slots
const mockUnavailableSlots = {
  '2025-09-20': ['10:00', '11:30', '15:00'],
  '2025-09-21': ['09:30', '14:30', '16:00'],
  '2025-09-22': ['10:30', '15:30'],
};

export default function BookAppointmentPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    treatmentId: '',
    doctorId: '',
    date: '',
    time: '',
    notes: '',
    patientName: 'John Doe', // Pre-filled with logged-in patient
    patientPhone: '+91 98765 43210',
    patientEmail: 'john.doe@example.com',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Generate next 30 days
  const availableDates = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i + 1));

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const isSlotAvailable = (date, time) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const unavailable = mockUnavailableSlots[dateStr] || [];
    return !unavailable.includes(time);
  };

  const getSelectedTreatment = () => mockTreatments.find(t => t.id === formData.treatmentId);
  const getSelectedDoctor = () => mockDoctors.find(d => d.id === formData.doctorId);

  if (isSuccess) {
    return (
      <div>
        <PageHeader
          title="Book Appointment"
          subtitle="Schedule your consultation or treatment session"
          icon={CalendarDaysIcon}
        />
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointment Booked Successfully!</h2>
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
            <h3 className="font-semibold text-gray-900 mb-3">Appointment Details:</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Treatment:</span> {getSelectedTreatment()?.name}</div>
              <div><span className="font-medium">Doctor:</span> {getSelectedDoctor()?.name}</div>
              <div><span className="font-medium">Date:</span> {format(new Date(formData.date), 'EEEE, MMM dd, yyyy')}</div>
              <div><span className="font-medium">Time:</span> {formData.time}</div>
              <div><span className="font-medium">Duration:</span> {getSelectedTreatment()?.duration}</div>
              <div><span className="font-medium">Fee:</span> {getSelectedTreatment()?.price}</div>
            </div>
          </div>
          <p className="text-gray-600 mb-6">
            You will receive a confirmation email shortly. Please arrive 15 minutes before your appointment time.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => {
                setStep(1);
                setFormData({
                  treatmentId: '',
                  doctorId: '',
                  date: '',
                  time: '',
                  notes: '',
                  patientName: 'John Doe',
                  patientPhone: '+91 98765 43210',
                  patientEmail: 'john.doe@example.com',
                });
                setIsSuccess(false);
              }}
              className="px-6 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              Book Another Appointment
            </button>
            <button
              onClick={() => window.location.href = '/my-appointments'}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              View My Appointments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Book Appointment"
        subtitle="Schedule your consultation or treatment session"
        icon={CalendarDaysIcon}
      />

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          {[
            { step: 1, title: 'Select Treatment' },
            { step: 2, title: 'Choose Doctor' },
            { step: 3, title: 'Pick Date & Time' },
            { step: 4, title: 'Confirm Details' },
          ].map((item, index) => (
            <div key={item.step} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= item.step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
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
                  step > item.step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Step 1: Select Treatment */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Treatment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockTreatments.map((treatment) => (
                <div
                  key={treatment.id}
                  onClick={() => setFormData({...formData, treatmentId: treatment.id})}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.treatmentId === treatment.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{treatment.name}</h3>
                    <span className="text-blue-600 font-semibold">{treatment.price}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{treatment.description}</p>
                  <span className="text-gray-500 text-sm">Duration: {treatment.duration}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Choose Doctor */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Doctor</h2>
            <div className="space-y-4">
              {mockDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  onClick={() => setFormData({...formData, doctorId: doctor.id})}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.doctorId === doctor.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                      <UserIcon className="h-8 w-8 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-gray-600">{doctor.specialization}</p>
                      <p className="text-gray-500 text-sm">Experience: {doctor.experience}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Pick Date & Time */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Pick Date & Time</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Select Date</h3>
                <div className="grid grid-cols-7 gap-2">
                  {availableDates.slice(0, 21).map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => setFormData({...formData, date: format(date, 'yyyy-MM-dd'), time: ''})}
                      className={`p-2 text-sm rounded-md ${
                        formData.date === format(date, 'yyyy-MM-dd')
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{format(date, 'dd')}</div>
                      <div className="text-xs">{format(date, 'EEE')}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Select Time</h3>
                {formData.date ? (
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => {
                      const available = isSlotAvailable(new Date(formData.date), time);
                      return (
                        <button
                          key={time}
                          onClick={() => available && setFormData({...formData, time})}
                          disabled={!available}
                          className={`p-2 text-sm rounded-md ${
                            formData.time === time
                              ? 'bg-blue-600 text-white'
                              : available
                              ? 'border border-gray-200 hover:bg-gray-50'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Please select a date first</p>
                )}
              </div>
            </div>
            
            {/* Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Any specific concerns or requirements..."
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 4: Confirm Details */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Confirm Details</h2>
            <div className="space-y-6">
              {/* Appointment Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Appointment Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Treatment:</span>
                    <div className="mt-1">{getSelectedTreatment()?.name}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Doctor:</span>
                    <div className="mt-1">{getSelectedDoctor()?.name}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date:</span>
                    <div className="mt-1">{format(new Date(formData.date), 'EEEE, MMM dd, yyyy')}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Time:</span>
                    <div className="mt-1">{formData.time}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <div className="mt-1">{getSelectedTreatment()?.duration}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Fee:</span>
                    <div className="mt-1 text-blue-600 font-semibold">{getSelectedTreatment()?.price}</div>
                  </div>
                </div>
                {formData.notes && (
                  <div className="mt-4">
                    <span className="font-medium text-gray-700">Notes:</span>
                    <div className="mt-1">{formData.notes}</div>
                  </div>
                )}
              </div>

              {/* Patient Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <div className="mt-1">{formData.patientName}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <div className="mt-1">{formData.patientPhone}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <div className="mt-1">{formData.patientEmail}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={step === 1}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={
                (step === 1 && !formData.treatmentId) ||
                (step === 2 && !formData.doctorId) ||
                (step === 3 && (!formData.date || !formData.time))
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}