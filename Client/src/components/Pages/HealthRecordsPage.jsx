import React, { useState } from 'react';
import {
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  BeakerIcon,
  CameraIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import PageHeader from '../Shared/PageHeader';

const mockHealthRecords = {
  vitals: [
    {
      id: '1',
      date: '2025-09-15',
      bloodPressure: '120/80',
      heartRate: '72',
      temperature: '98.6°F',
      weight: '70 kg',
      height: '175 cm',
      bmi: '22.9',
    },
    {
      id: '2',
      date: '2025-09-01',
      bloodPressure: '118/78',
      heartRate: '75',
      temperature: '98.4°F',
      weight: '69.5 kg',
      height: '175 cm',
      bmi: '22.7',
    },
  ],
  consultations: [
    {
      id: '1',
      date: '2025-09-15',
      doctor: 'Dr. Ayurveda Kumar',
      complaint: 'Stress and anxiety management',
      diagnosis: 'Vata imbalance, stress-related disorders',
      treatment: 'Panchakarma therapy, meditation, herbal medicines',
      nextVisit: '2025-09-25',
    },
    {
      id: '2',
      date: '2025-09-01',
      doctor: 'Dr. Ayurveda Kumar',
      complaint: 'Initial consultation for wellness program',
      diagnosis: 'Overall health assessment, preventive care',
      treatment: 'Customized wellness plan, dietary recommendations',
      nextVisit: '2025-09-15',
    },
  ],
  labReports: [
    {
      id: '1',
      name: 'Complete Blood Count (CBC)',
      date: '2025-09-10',
      status: 'Normal',
      doctor: 'Dr. Ayurveda Kumar',
      type: 'blood-test',
      file: 'cbc_report_sept_2025.pdf',
    },
    {
      id: '2',
      name: 'Liver Function Test',
      date: '2025-09-10',
      status: 'Normal',
      doctor: 'Dr. Ayurveda Kumar',
      type: 'blood-test',
      file: 'lft_report_sept_2025.pdf',
    },
    {
      id: '3',
      name: 'X-Ray Chest',
      date: '2025-08-28',
      status: 'Normal',
      doctor: 'Dr. Ayurveda Kumar',
      type: 'imaging',
      file: 'xray_chest_aug_2025.pdf',
    },
  ],
  prescriptions: [
    {
      id: '1',
      date: '2025-09-15',
      doctor: 'Dr. Ayurveda Kumar',
      medicines: [
        { name: 'Triphala Churna', dosage: '1 tsp', timing: 'Before bed', duration: '30 days' },
        { name: 'Ashwagandha Tablet', dosage: '2 tablets', timing: 'After breakfast', duration: '60 days' },
        { name: 'Brahmi Ghrita', dosage: '1/2 tsp', timing: 'With warm milk', duration: '45 days' },
      ],
    },
    {
      id: '2',
      date: '2025-09-01',
      doctor: 'Dr. Ayurveda Kumar',
      medicines: [
        { name: 'Saraswatarishta', dosage: '2 tbsp', timing: 'After meals', duration: '30 days' },
        { name: 'Shankhpushpi Syrup', dosage: '1 tbsp', timing: 'Morning', duration: '30 days' },
      ],
    },
  ],
};

const recordTypes = [
  { id: 'all', name: 'All Records', icon: DocumentTextIcon },
  { id: 'vitals', name: 'Vitals', icon: HeartIcon },
  { id: 'consultations', name: 'Consultations', icon: ClipboardDocumentListIcon },
  { id: 'labReports', name: 'Lab Reports', icon: BeakerIcon },
  { id: 'prescriptions', name: 'Prescriptions', icon: CameraIcon },
];

export default function HealthRecordsPage() {
  const [activeType, setActiveType] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleDownload = (filename) => {
    // Simulate file download
    alert(`Downloading ${filename}...`);
  };

  const handleView = (record) => {
    setSelectedRecord(record);
  };

  const VitalsCard = ({ vital }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <HeartIcon className="h-5 w-5 text-red-500 mr-2" />
          <span className="font-medium text-gray-900">Vital Signs</span>
        </div>
        <span className="text-sm text-gray-500">
          {format(new Date(vital.date), 'MMM dd, yyyy')}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-600">Blood Pressure:</span>
          <span className="ml-2 font-medium">{vital.bloodPressure}</span>
        </div>
        <div>
          <span className="text-gray-600">Heart Rate:</span>
          <span className="ml-2 font-medium">{vital.heartRate} bpm</span>
        </div>
        <div>
          <span className="text-gray-600">Weight:</span>
          <span className="ml-2 font-medium">{vital.weight}</span>
        </div>
        <div>
          <span className="text-gray-600">BMI:</span>
          <span className="ml-2 font-medium">{vital.bmi}</span>
        </div>
      </div>
    </div>
  );

  const ConsultationCard = ({ consultation }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <ClipboardDocumentListIcon className="h-5 w-5 text-blue-500 mr-2" />
          <span className="font-medium text-gray-900">Consultation</span>
        </div>
        <span className="text-sm text-gray-500">
          {format(new Date(consultation.date), 'MMM dd, yyyy')}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-600">Doctor:</span>
          <span className="ml-2 font-medium">{consultation.doctor}</span>
        </div>
        <div>
          <span className="text-gray-600">Complaint:</span>
          <span className="ml-2">{consultation.complaint}</span>
        </div>
        <div>
          <span className="text-gray-600">Diagnosis:</span>
          <span className="ml-2">{consultation.diagnosis}</span>
        </div>
      </div>
    </div>
  );

  const LabReportCard = ({ report }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <BeakerIcon className="h-5 w-5 text-green-500 mr-2" />
          <span className="font-medium text-gray-900">{report.name}</span>
        </div>
        <span className="text-sm text-gray-500">
          {format(new Date(report.date), 'MMM dd, yyyy')}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-600">Status:</span>
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
            report.status === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {report.status}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Doctor:</span>
          <span className="ml-2">{report.doctor}</span>
        </div>
        <div className="flex space-x-2 mt-3">
          <button
            onClick={() => handleView(report)}
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            View
          </button>
          <button
            onClick={() => handleDownload(report.file)}
            className="flex items-center text-green-600 hover:text-green-800 text-sm"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
            Download
          </button>
        </div>
      </div>
    </div>
  );

  const PrescriptionCard = ({ prescription }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <CameraIcon className="h-5 w-5 text-purple-500 mr-2" />
          <span className="font-medium text-gray-900">Prescription</span>
        </div>
        <span className="text-sm text-gray-500">
          {format(new Date(prescription.date), 'MMM dd, yyyy')}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-600">Doctor:</span>
          <span className="ml-2 font-medium">{prescription.doctor}</span>
        </div>
        <div>
          <span className="text-gray-600 block mb-1">Medicines:</span>
          {prescription.medicines.map((medicine, index) => (
            <div key={index} className="ml-4 mb-1">
              <span className="font-medium">{medicine.name}</span>
              <span className="text-gray-600"> - {medicine.dosage} {medicine.timing} for {medicine.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRecords = () => {
    if (activeType === 'all') {
      return (
        <div className="space-y-4">
          {mockHealthRecords.vitals.map(vital => (
            <VitalsCard key={vital.id} vital={vital} />
          ))}
          {mockHealthRecords.consultations.map(consultation => (
            <ConsultationCard key={consultation.id} consultation={consultation} />
          ))}
          {mockHealthRecords.labReports.map(report => (
            <LabReportCard key={report.id} report={report} />
          ))}
          {mockHealthRecords.prescriptions.map(prescription => (
            <PrescriptionCard key={prescription.id} prescription={prescription} />
          ))}
        </div>
      );
    } else {
      const records = mockHealthRecords[activeType] || [];
      return (
        <div className="space-y-4">
          {records.map(record => {
            switch (activeType) {
              case 'vitals':
                return <VitalsCard key={record.id} vital={record} />;
              case 'consultations':
                return <ConsultationCard key={record.id} consultation={record} />;
              case 'labReports':
                return <LabReportCard key={record.id} report={record} />;
              case 'prescriptions':
                return <PrescriptionCard key={record.id} prescription={record} />;
              default:
                return null;
            }
          })}
        </div>
      );
    }
  };

  return (
    <div>
      <PageHeader
        title="Health Records"
        subtitle="View your medical history, test results, and health documents"
        icon={DocumentTextIcon}
      />

      <div className="flex">
        {/* Sidebar */}
        <div className="w-1/4 bg-white rounded-lg shadow-sm border border-gray-200 mr-6 h-fit">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Record Types</h3>
          </div>
          <nav className="p-2">
            {recordTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeType === type.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {type.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderRecords()}
        </div>
      </div>
    </div>
  );
}